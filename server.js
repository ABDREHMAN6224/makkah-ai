import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import {fileURLToPath } from "url";
// import MasjidHaramLocations from "./utils/locations.js";
import connectDb from "./connection/db.js";
import Location from "./models/location.js";
import MasjidHaramLocations from "./utils/locations.js";

dotenv.config()

const __dirname=path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json({ limit: "10kb" }));
app.use(express.static(`${__dirname}/public`));
app.use(cors())

app.get("/", async (req, res) => {
    const allLocations=await Location.find().populate
    ({
        path:"neighbours.location",
        select:"name capacity category floor accessibility"
    });

    const adjacencyListOfGraphOfLocations={};
    allLocations.forEach((location)=>{
        adjacencyListOfGraphOfLocations[location.name]=location.neighbours;
    });
    // res.json(adjacencyListOfGraphOfLocations);
    res.json(allLocations);
})

app.get("/distances/:latlng/:unit", async (req, res) => {
    const {latlng,unit}=req.params;
    const [lat,lng]=latlng.split(",");
    const multiplier=unit==="mi"?0.000621371:0.001;
    if(!lat||!lng){
        return res.status(400).json({
            status:"fail",
            message:"Please provide latitude and longitude in the format lat,lng"
        });
    }
    const distances=await Location.aggregate([
        {
            $geoNear:{
                near:{
                    type:"Point",
                    coordinates:[lng*1,lat*1]
                },
                distanceField:"distance",
                distanceMultiplier:multiplier
            }
        },
        {
            $project:{
                distance:1,
                name:1
            }
        }
    ]);
    res.json({
        status:"success",
        data:{
            data:distances
        }
    });

})

app.get("/assignNeighboursExactDustances", async (req, res) => {
    const allLocations=await Location.find();
    allLocations.forEach(async (location)=>{
        const distances=await Location.aggregate([
            {
                $geoNear:{
                    near:{
                        type:"Point",
                        coordinates:location.startingLocation.coordinates
                    },
                    distanceField:"distance",
                    maxDistance:1000,
                    spherical:true
                },
            },
            {
                $project:{
                    distance:1,
                    name:1
                },
            },
        ]);
        //check neighbours and if they are in neighbours then update the distance
        const neighbours=location.neighbours||[];
        neighbours.forEach((neighbour)=>{
            const distance=distances.find((distance)=>distance.name===neighbour.location.name);
            if(distance){
                neighbour.distance=distance.distance;
            }
        });
        await location.save();
    });
    res.json(allLocations);
})

// app.get("/assignRandomNeighbours", async (req, res) => {
//     const allLocations=await Location.find();
//     allLocations.forEach(async (location)=>{
//         const randomLocationIndex=Math.floor(Math.random()*allLocations.length);
//         const randomLocation=allLocations[randomLocationIndex];
//         if(randomLocation._id.toString()!==location._id.toString()){
//             const distance=Math.floor(Math.random()*1000);
//             location.neighbours.push({
//                 location:randomLocation._id,
//                 distance
//             });
//         }
//     });
//     allLocations.forEach(async (location)=>{
//         await location.save();
//     });
//     res.json(allLocations);
// })

connectDb();
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});