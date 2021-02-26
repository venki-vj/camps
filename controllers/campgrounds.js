const campground=require('../models/campground')
const {cloudinary}=require('../cloudinary')
const mbxGeocoding=require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async(req,res)=>{
    const campgrounds = await campground.find({});  
    res.render('campgrounds/index',{campgrounds})
 };
module.exports.newForm=(req,res)=>{  
    res.render('campgrounds/new');
}
module.exports.newCamp=async(req,res,next)=>{
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campgrounds = new campground(req.body.campground);
    campgrounds.geometry = geoData.body.features[0].geometry;
    campgrounds.images=req.files.map(f=>({url:f.path,filename:f.filename}))
    campgrounds.author=req.user._id;
    await campgrounds.save();
    req.flash('success', 'Successfully made a new campground')
    res.redirect(`/campgrounds/${campgrounds._id}`)
}
module.exports.show=async(req,res)=>{
    const campgrounds =await campground.findById(req.params.id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author');
    
    if(!campgrounds){
        req.flash('error',"Can't find campground");
       return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show',{campgrounds});
}
module.exports.edit=async(req,res)=>{
    const {id}=req.params;
    const campgrounds =await campground.findById(id);
    if(!campgrounds){
       req.flash('error',"Can't find campground");
      return res.redirect('/campgrounds')
   }
   
    res.render('campgrounds/edit',{campgrounds})
}
module.exports.editPut=async(req,res)=>{
    const {id}=req.params;
    const campgrounds =await campground.findByIdAndUpdate(id, {...req.body.campground});
    const imgs=req.files.map(f=>({url:f.path,filename:f.filename}))
    campgrounds.images.push(...imgs);
    await campgrounds.save()
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
                await cloudinary.uploader.destroy(filename);
        }
        await campgrounds.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}})
    }
    req.flash('success','Successfully updated!!')
    res.redirect(`/campgrounds/${campgrounds._id}`)
}
module.exports.delete=async(req,res)=>{
    const {id}=req.params;
    await campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
}

