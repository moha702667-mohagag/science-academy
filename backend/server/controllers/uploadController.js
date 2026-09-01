import cloudinary from "../config/cloudinary.js";

export const uploadImage = async (req, res) => {
  try {
    console.log("UPLOAD CONTROLLER STARTED");

    console.log("REQ.FILE:", req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file received. Make sure the field name is 'image'.",
      });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "science-academy/questions",
        },
        (error, result) => {
          if (error) {
            console.error("CLOUDINARY ERROR:", error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      stream.end(req.file.buffer);
    });

    console.log("CLOUDINARY RESULT:", result.secure_url);

    return res.status(200).json({
      success: true,
      image: result.secure_url,
    });
  } catch (error) {
    console.error("UPLOAD IMAGE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Upload Error",
    });
  }
};