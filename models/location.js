import mongoose from 'mongoose';
import MasjidHaramLocations from '../utils/locations.js';


const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: "Name is required",
  },
  startingLocation: { //embedded document => startLocation has a document embedded in it
      type:{
          type:String,
          default:"Point",
          enum:["Point"]
      },
      coordinates:[Number],
      address:String,
      description:String
  },
  capacity: {
    type: Number,
    default: 0,
  },
  neighbours: [
    {
      location: {
        type: mongoose.Schema.ObjectId,
        ref: "Location",
      },
      distance: {
        type: Number,
        default: 0,
      },
    },
  ],
  category: {
    type: String,
    trim: true,
  },
  floor: {
    type: String,
  },
  accessibility: { 
    type: Boolean,
     default: true
 }, // Accessibility for people with disabilities
  image: {
    type: String,
    trim: true,
 }, // Image URL
},{
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

locationSchema.index({ startingLocation: "2dsphere" });
locationSchema.index({ name: "text" });

// locationSchema.methods.getNeighbours = async function () {
//   const location = await this.model("Location").findById(this._id).populate({
//     path: "neighbours.location",
//     // select: "name  capacity category floor  accessibility",
//   });
//   return location.neighbours;
// };

// locationSchema.methods.getNeighbour = async function (neighbourId) {
//     const location = await this.model("Location").findById(this._id).populate({
//         path: "neighbours.location",
//         // select: "name   capacity category floor  accessibility",
//     });
//     return location.neighbours.find((neighbour) => neighbour.location._id == neighbourId);
// };

// locationSchema.pre("find", async function (next) {
//   this.populate({
//     path: "neighbours.location",
//     // select: "name   capacity category floor  accessibility",
//   });
//   next();
// }
// );
//         // select: "name   capacity category floor  accessibility",);
//     const neighbours = this.neighbours||[];
    // const disstances=neighbours.map(async (neighbour) => {
    //     return await Location.aggregate([
    //         {
    //             $geoNear:{
    //                 near:{
    //                     type:"Point",
    //                     coordinates:neighbour.location.startingLocation.coordinates
    //                 },
    //                 distanceField:"distance",
    //                 maxDistance:1000,
    //                 spherical:true
    //             },

    //         },
    //         {
    //             $project:{
    //                 distance:1,
    //             },

    //         },
    //     ])
    // });

    // const distancesResolved=await Promise.all(disstances);
    // neighbours.forEach((neighbour,index)=>{
    //     neighbour.distance=distancesResolved[index][0].distance;
    // });
    // this.neighbours=neighbours;
    // next();
// });   

locationSchema.virtual("neighbourCount").get(function () {
    return this.neighbours?.length;
});
// locationSchema.pre(/^find/, function (next) {
//     this.populate({
//         path: "neighbours.location",
//     });
//     next();
// });



const Location= mongoose.model("Location", locationSchema);

export default Location;