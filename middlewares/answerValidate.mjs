const answerValidate = (req, res, next) =>{
    const { content } = req.body;

    if(!content || typeof content !== "string" || content.length > 300){
        return res.status(400).json({"message": "Invalid request data."})
    }

    next();
}

export default answerValidate;