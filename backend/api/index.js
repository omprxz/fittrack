const express = require("express");
const fs = require("fs");
const { google } = require("googleapis");
const multer = require("multer");
const sharp = require('sharp')
//npm install --cpu=wasm32 sharp
//npm install @img/sharp-wasm32
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const sanitizeHtml = require("sanitize-html");
const mongoose = require("mongoose");
const nodemailer = require('nodemailer');
require('dotenv').config()


require("../db/config");
const User = require("../db/User");
const Categories = require("../db/Categories");
const Logs = require("../db/Logs");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
let rootDir;

const PORT = process.env.PORT || 5555

if(process.env.NODE_ENV == 'production'){
    rootDir = '/tmp/'
}else{
    rootDir = './tmp/'
    const dir = path.join(__dirname, rootDir);

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}
}

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const logC = console.log;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const SCOPE = ["https://www.googleapis.com/auth/drive"];
async function authorize() {
  const googleApi = JSON.parse(process.env.GOOGLE_DRIVE_API_CREDS);
  const jwtClient = new google.auth.JWT(
    googleApi.client_email,
    null,
    googleApi.private_key,
    SCOPE
  );
  await jwtClient.authorize();
  return jwtClient;
}

async function uploadFile(authClient, photo, parents) {
  return new Promise((resolve, reject) => {
    const drive = google.drive({ version: 'v3', auth: authClient });
    const fileName = `${path.basename(photo.originalname, path.extname(photo.originalname))}_${uuidv4()}${path.extname(photo.originalname).toLowerCase()}`;
    const fileMetaData = {
      name: fileName,
      parents: [parents]
    };

    drive.files.create({
      resource: fileMetaData,
      media: {
        body: fs.createReadStream(photo.path),
        mimeType: photo.mimetype
      }
    }, async (err, file) => {
      if (err) {
        reject(err);
      } else {
        try {
          await drive.permissions.create({
            fileId: file.data.id,
            requestBody: {
              role: 'reader',
              type: 'anyone'
            }
          });
          resolve(file.data.id);
        } catch (err) {
          reject(err);
        }
      }
    });
  });
}

async function sendEmail(email, otp) {
  const password = process.env.GAMIL_APP_PASSWORD;
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'fittrackdesk@gmail.com',
      pass: password,
    },
  });

  const message = {
    from: 'fittrackdesk@gmail.com',
    to: email,
    subject: 'Your OTP for Password Reset',
    text: `Your OTP for password reset is: ${otp}`,
  };

  try {
    const info = await transporter.sendMail(message);
    return { message: 'Email sent!', status: 'success', info };
  } catch (err) {
    console.error('Error sending email:', err);
    throw err;
  }
}

const deleteFileFromDrive = async (fileId, authClient) => {
  try {
    const drive = google.drive({ version: 'v3', auth: authClient });
    await drive.files.delete({
      fileId: fileId,
    });
    return true;
  } catch (err) {
    console.error(`Error deleting file ${fileId} from Google Drive`);
    throw `Error deleting file ${fileId} from Google Drive`;
  }
};

app.get("/", (req, resp) => {
  resp.send('<h5>FitTrack API Working...</h5>')
})

app.post("/api/signup", async (req, resp) => {
    const { name, email, password, ip } = req.body;
    if (name && email && password) {
        if (!emailRegex.test(email)) {
            return resp.json({
                message: "Invalid email address",
                signedUp: false
            });
        } else {
            try {
                const checkUser = await User.findOne({ email: email });
                if (checkUser) {
                    resp.json({
                        message: "Email id already exists",
                        signedUp: false
                    });
                } else {
                    await User.create({ name, email, password, ip });
                    resp.json({
                        message: "User registered successfully",
                        signedUp: true
                    });
                }
            } catch (e) {
                console.error(e);
                resp.json({
                    message: "Error while saving details"
                });
            }
        }
    } else {
        resp.json({
            message: "All fields mandatory"
        });
    }
});

app.post("/api/login", async (req, resp) => {
    try {
        const { email, password } = req.body;
        
        if (email && password) {
            if (!emailRegex.test(email)) {
                return resp.json({
                    message: "Invalid email address",
                    signedUp: false
                });
            } else {
              const logIn = await User.findOne({ email, password })
            .select("-password")
            .select("-ip");
                if (logIn) {
                    resp.json({
                        message: "Logged in",
                        creds: {
                            logIn
                        },
                        loggedIn: true
                    });
                } else {
                    resp.json({
                        message: "Invalid credentials"
                    });
                }
            }
        } else {
            resp.json({
                message: "All fields mandatory"
            });
        }
    } catch (e) {
        resp.json({
            message: "Internal server error"
        });
    }
});

app.get("/api/user", async (req, resp) => {
  const {userId} = req.query
  try{
  const response = await User.findOne({_id: userId}).select("-password -_id -ip")
  if(response){
    resp.json({
      message: "Details fetched",
      icon: "success",
      user: response
    })
  }
  }catch(e){
    resp.json({
      message: "Can't fetch details",
      icon: "error"
    })
  }
})

app.delete("/api/user", async (req, resp) => {
  const { userId } = req.body;

  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return resp.json({
        message: "User not found",
        icon: "error"
      });
    }
    try{
    const authClient = await authorize();

    if (user.pp) {
      await deleteFileFromDrive(user.pp, authClient);
    }
    }catch(e){
      console.log(e)
    }
    const logs = await Logs.find({ userId });
    for (const log of logs) {
      try{
        const authClient = await authorize();
      for (const photoId of log.photos) {
        await deleteFileFromDrive(photoId, authClient);
      }
      }catch(e){
        console.log(e)
      }
      await Logs.deleteOne({ _id: log._id });
    }

    await Categories.deleteMany({ userId });
    await User.deleteOne({ _id: userId });

    resp.json({
      message: "User and all related data deleted successfully",
      icon: "success"
    });
  } catch (error) {
    console.error("Error deleting user data:", error);
    resp.json({
      message: "Error deleting user data",
      icon: "error",
      error: error.message
    });
  }
});
app.put("/api/user", upload.single("profile"), async (req, resp) => {
  const { name, email, userId } = req.body
  let update;
  if(req.file){
    const sizeLimitInMB = 2;
     const photo = req.file
     let photoSize = photo.size;
     if (photoSize > sizeLimitInMB * 1024 * 1024) {
        resp.json({message: "Maximum file size limit is "+sizeLimitInMB+"MB Only.", icon: "error"})
     }
            const photoPath = path.join(rootDir, photo.originalname);
            let image = sharp(photo.buffer);
            let format;
            switch (photo.mimetype) {
              case "image/jpeg":
                format = "jpeg";
                break;
              case "image/jpg":
                format = "jpg";
                break;
              case "image/png":
                format = "png";
                break;
              case "image/webp":
                format = "webp";
                break;
              default:
                format = ""
            }
            if (format !== "") {
              image = image.toFormat(format, { quality: 75 });
            }
            await image.toFile(photoPath);
            try {
              const authClient = await authorize();
              const fileId = await uploadFile(authClient, { path: photoPath, mimetype: photo.mimetype, originalname: photo.originalname }, process.env.DRIVE_PPPHOTOS_DIR);
              try{
              let userData = await User.findById(userId)
              await deleteFileFromDrive(userData.pp, authClient)
              }catch(e){console.log(e)}
              update = await User.updateOne({_id: userId}, {name, email, pp: fileId})
            } catch (err) {
              console.log(err.message);
              resp.json({message: err.message, icon: 'error'})
            }
            fs.unlinkSync(photoPath);
  }
  else{
    try{
      update = await User.updateOne({_id: userId}, {name, email});
    }catch(e){
      resp.json({message: e, icon:'error'})
      return
    }
  }
  if(update.modifiedCount > 0){
    const userDets = await User.findOne({_id: userId}).select("-password -ip");
    resp.json({message: "Profile Updated.", icon: "success", user: {logIn: userDets}})
  }else{
    resp.json({message: "No update made.", icon: "info"})
  }
})

app.get("/api/usermeta", async (req, resp) => {
  const { userId } = req.query;

  try {
    const latestLog = await Logs.findOne({ userId }).sort({ date: -1 });
    const totalLogs = await Logs.countDocuments({ userId });

    const response = {
      weight: latestLog?.weight,
      height: latestLog?.height,
      weightUnit: latestLog?.weightUnit,
      heightUnit: latestLog?.heightUnit,
      fat: latestLog?.fat,
      totalLogs: totalLogs
    };

    resp.json({
      message: "Details fetched",
      icon: "success",
      user: response
    });
  } catch (err) {
    resp.json({ message: err.message, icon: "error" });
  }
});

app.patch('/api/user/password', async (req, resp) => {
  const { userId, currentPassword, newPassword } = req.body;
  if(currentPassword == ""){
      return resp.json({
        message: 'Current password required',
        icon: 'error'
      });
    }
  if(newPassword == ""){
      return resp.json({
        message: 'New password required',
        icon: 'error'
      });
    }
  try {
    const user = await User.findById(userId);

    if (!user) {
      return resp.json({
        message: 'User not found',
        icon: 'error'
      });
    }

    if (user.password !== currentPassword) {
      return resp.json({
        message: 'Current password is incorrect',
        icon: 'error'
      });
    }

    user.password = newPassword;
    await user.save();

    resp.json({
      message: 'Password updated successfully',
      icon: 'success'
    });
  } catch (error) {
    console.error(error);
    resp.json({
      message: 'Error while updating password',
      icon: 'error'
    });
  }
});

app.patch('/api/user/deletepp', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.json({ message: 'User ID is required', icon: 'error' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ message: 'User not found', icon: 'error' });
    }

    const profilePhotoId = user.pp;
    if (!profilePhotoId) {
      return res.json({ message: 'No profile photo to delete', icon: 'info' });
    }

    const authClient = await authorize();
    await deleteFileFromDrive(profilePhotoId, authClient);

    user.pp = null;
    await user.save();

    res.json({ message: 'Profile photo removed', icon: 'success' });
  } catch (error) {
    console.error('Error deleting profile photo:', error);
    res.json({ message: 'Internal server error', icon: 'error' });
  }
});

app.get('/api/user/export', async (req, res) => {
  const { userId } = req.query;
  try {
    const categories = await Categories.find({ userId }).select("-_id").select("-userId").select("-created_at").select("-updated_at");
    const logs = await Logs.find({ userId }).select("-_id").select("-userId").select("-created_at").select("-updated_at");

    // Transform logs to replace photo IDs with full URLs
    const transformedLogs = logs.map(log => ({
      ...log.toObject(),
      photos: log.photos.map(photoId => `https://lh3.googleusercontent.com/d/${photoId}=w1000`)
    }));

    const userData = {
      categories,
      logs: transformedLogs
    };

    res.json(userData);
  } catch (error) {
    res.json({ message: 'Error exporting data', icon: 'error', error: error.message });
  }
});

app.post('/api/sendotp', async (req, res) => {
  const { userName, otp, email } = req.body;

  try {
    const sendEmailResponse = await sendEmail(email, otp);
    res.json({
      message: 'OTP sent successfully',
      icon: 'success',
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.json({
      message: 'Failed to send OTP',
      icon: 'error',
      error: error.message,
    });
  }
});

app.post('/api/resetpassword', async (req, res) => {
  const { userName, password } = req.body;

  try {
    await User.updateOne({ email: userName }, { $set: { password } });

    res.json({
      message: 'Password reset successfully',
      icon: 'success',
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.json({
      message: 'Failed to reset password',
      icon: 'error',
      error: error.message,
    });
  }
});

app.post("/api/categories", async (req, resp) => {
    const { userId, categories } = req.body;
    if (userId && categories) {
        try {
            let existingUser = await Categories.findOne({ userId });
            if (existingUser) {
                // User exists, update categories
                if (!existingUser.categories.includes(categories)) {
                    existingUser.categories.push(categories);
                    await existingUser.save();
                    resp.json({
                        message: "Category Added",
                        icon: "success"
                    });
                } else {
                    resp.json({
                        message: "Duplicate Category",
                        icon: "error"
                    });
                }
            } else {
                // User doesn't exist, create new entry
                const createCat = await Categories.create({
                    userId,
                    categories
                });
                resp.json({
                    message: "Category Added",
                    icon: "success"
                });
            }
        } catch (error) {
            resp.json({ message: "Internal Server Error" });
        }
    } else {
        resp.json({
            message: "All fields mandatory"
        });
    }
});

app.get("/api/categories", async (req, resp) => {
    const { userId, noResp } = req.query;
    if (userId) {
        try {
            const categ = await Categories.find({ userId }).select("categories");
            //logC(categ)
            if (categ.length > 0) {
                resp.json({
                    message: "Categories fetched",
                    categFetched: true,
                    categories: [...categ]
                });
            } else {
                resp.json({
                    message: "No categories for the user."
                });
            }
        } catch (error) {
            resp.json({ message: "Internal Server Error" });
        }
    } else {
        resp.json({
            message: "User ID is required"
        });
    }
});

app.delete("/api/categories", async (req, resp) => {
    const { preValues, userId } = req.body;
    if (preValues !== undefined && userId) {
        try {
            const user = await Categories.findOne({ userId });
            if (user) {
                const promises = preValues.map(async (preValue) => {
                    if (user.categories.includes(preValue)) {
                        const index = user.categories.indexOf(preValue);
                        if (index !== -1) {
                            user.categories.splice(index, 1);
                        }
                    } else {
                        resp.json({
                            message: "Value doesn't exists",
                            icon: "error"
                        });
                    }
                });
                await Promise.all(promises);
                await user.save();
                resp.json({
                    message: "Categories deleted",
                    icon: "success"
                });
            } else {
                resp.json({
                    message: "User not found",
                    icon: "error"
                });
            }
        } catch (error) {
            resp.json({
                message: error.message || "Internal Server Error",
                icon: "error"
            });
        }
    } else {
        resp.json({
            message: "Category index and user ID are required",
            icon: "error"
        });
    }
});

app.put("/api/categories", async (req, resp) => {
    const { userId, preValue, newValue } = req.body;
    if (userId && preValue !== undefined && newValue !== undefined) {
        try {
            const user = await Categories.findOne({ userId });
            if (user) {
                if (user.categories.includes(preValue)) {
                    if (!user.categories.includes(newValue)) {
                        const index = user.categories.indexOf(preValue);
                        if (index !== -1) {
                            user.categories[index] = newValue;
                        }
                        await user.save();
                        resp.json({
                            message: "Category updated",
                            icon: "success"
                        });
                    } else {
                        resp.json({
                            message: "Duplicate Category",
                            icon: "error"
                        });
                    }
                } else {
                    resp.json({
                        message: "Invalid category"
                    });
                }
            } else {
                resp.json({
                    message: "User not found",
                    icon: "error"
                });
            }
        } catch (error) {
            resp.json({
                message: "Internal Server Error",
                icon: "error"
            });
        }
    } else {
        resp.json({
            message: "User ID, category, and new value are required",
            icon: "error"
        });
    }
});

app.post("/api/log", upload.array("photos", 8), async (req, resp) => {
  try {
    let {
      userId,
      date,
      categories,
      weight,
      weightUnit,
      height,
      heightUnit,
      fat,
      note
    } = req.body;
    
    categories = JSON.parse(categories);
    const sanitizedNote = sanitizeHtml(note, {
      allowedTags: [],
      allowedAttributes: {}
    });

    let existingUser = await Categories.findOne({ userId });
    if (existingUser) {
      categories.forEach(async (category) => {
        if (!existingUser.categories.includes(category)) {
          existingUser.categories.push(category);
        }
      });
      await existingUser.save();
    } else {
      await Categories.create({
        userId,
        categories
      });
    }

    let upPhotos = [];
    if (!req.files || req.files.length === 0) {
      resp.json({
        message: "No images provided.",
        icon: "error"
      });
    } else {
      if (req.files.length > 8 || req.files.length == 0) {
        if (req.files.length > 8) {
        resp.json({
          message: "Max allowed images are 8 only.",
          icon: "error"
        });
      }else if (req.files.length == 0) {
        resp.json({
          message: "There must be at least one image.",
          icon: "error"
        });
      }
      } else {
        const sizeLimitInMB = 8;
        let loopResp = {
          message: "",
          icon: "noerr"
        };

        const authClient = await authorize();

        for (const photo of req.files) {
          let photoSize = photo.size;
          if (photoSize > sizeLimitInMB * 1024 * 1024) {
            loopResp.message = `Max file size limit is ${sizeLimitInMB} MB for each image`;
            loopResp.icon = "error";
          } else {
            const photoPath = path.join(rootDir, photo.originalname);
            let image = sharp(photo.buffer);
            let format;
            switch (photo.mimetype) {
              case "image/jpeg":
                format = "jpeg";
                break;
              case "image/jpg":
                format = "jpg";
                break;
              case "image/png":
                format = "png";
                break;
              case "image/webp":
                format = "webp";
                break;
              default:
                format = ""
            }
            if (format !== "") {
              image = image.toFormat(format, { quality: 75 });
            }
            await image.toFile(photoPath);
            try {
              const fileId = await uploadFile(authClient, { path: photoPath, mimetype: photo.mimetype, originalname: photo.originalname }, process.env.DRIVE_LOGPHOTOS_DIR);
              upPhotos.push(fileId);
            } catch (err) {
              loopResp.message = err.message;
              loopResp.icon = "error";
              console.log(err.message);
              break;
            }
            fs.unlinkSync(photoPath);
          }

          if (loopResp.icon !== "noerr") {
            break;
          }
        }

        if (loopResp.icon !== "noerr") {
          resp.json(loopResp);
        } else {
          const LogSave = await Logs.create({
            userId,
            date,
            photos: upPhotos,
            categories,
            weight,
            weightUnit,
            height,
            heightUnit,
            fat,
            note: sanitizedNote
          });
          if (LogSave) {
            resp.json({
              message: "Log saved successfully.",
              log: LogSave,
              icon: "success"
            });
          } else {
            resp.json({
              message: "Can't save log.",
              log: LogSave,
              icon: "error"
            });
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
    resp.json({
      message: "Error while saving log.",
      icon: "error"
    });
    console.log(error);
  }
});
app.get("/api/log", async (req, resp) => {
    const { logId, userId } = req.query;
    try {
        const logFetched = await Logs.find({ _id: logId, userId });
        if(logFetched.length > 0){
            resp.json({
                message: "Log fetched",
                icon: "success",
                log: logFetched
            });
        } else {
            resp.json({
                message: "Log not found",
                icon: "error"
            });
        }
    } catch (err) {
        resp.json({message: err.message, icon: 'error'});
    }
});

app.put("/api/log", upload.array("photos", 8), async (req, resp) => {
  try {
    let {
      userId,
      logId,
      date,
      categories,
      weight,
      weightUnit,
      height,
      heightUnit,
      fat,
      note,
      deletedImage
    } = req.body;
    weight = weight == "null" ? null : weight
    height = height == "null" ? null : height
    fat = fat== "null" ? null : fat
    
    categories = JSON.parse(categories);
    deletedImage = JSON.parse(deletedImage);
    const sanitizedNote = sanitizeHtml(note, {
      allowedTags: [],
      allowedAttributes: {}
    });
    
    const logFetched = await Logs.find({_id: logId})
    
    if (deletedImage.length >= logFetched[0].photos.length) {
      if(req.files){
      if(req.files.length == 0){
        resp.json({
          message: "There must be at least one image.",
          icon: "error"
        });
        return;
      }
      }
      }
    
    const logFolder = rootDir;
    let upPhotos = [];

    if (req.files) {
      if (req.files.length > 8) {
        resp.json({
          message: "Max allowed images are 8 only.",
          icon: "error"
        });
        return;
      }

      if (!fs.existsSync(logFolder)) {
        fs.mkdirSync(logFolder, {
          recursive: true
        });
      }

      const sizeLimitInMB = 8;
      for (const photo of req.files) {
        let photoSize = photo.size;
        if (photoSize > sizeLimitInMB * 1024 * 1024) {
          resp.json({
            message: `Max file size limit is ${sizeLimitInMB} MB for each image`,
            icon: "error"
          });
          return; // Exit if image size exceeds limit
        }

        const photoPath = path.join(logFolder, photo.originalname);
        let image = sharp(photo.buffer);
        let format;
        switch (photo.mimetype) {
          case "image/jpeg":
            format = "jpeg";
            break;
          case "image/jpg":
            format = "jpg";
            break;
          case "image/png":
            format = "png";
            break;
          case "image/webp":
            format = "webp";
            break;
          default:
            format = ""
        }
        if (format !== "") {
          image = image.toFormat(format, { quality: 75 });
        }
        await image.toFile(photoPath);

        try {
          const authClient = await authorize();
          const fileId = await uploadFile(authClient, { path: photoPath, mimetype: photo.mimetype, originalname: photo.originalname },process.env.DRIVE_LOGPHOTOS_DIR);
          upPhotos.push(fileId);
        } catch (err) {
          console.error(`Error uploading file ${photo.originalname}:`, err);
          resp.json({
            message: `Error uploading file ${photo.originalname}`,
            icon: "error"
          });
          return;
        }

        fs.unlinkSync(photoPath);
      }
    }

    let existingUser = await Categories.findOne({ userId });
    if (existingUser) {
      categories.forEach(async (category) => {
        if (!existingUser.categories.includes(category)) {
          existingUser.categories.push(category);
        }
      });
      await existingUser.save();
    } else {
      await Categories.create({
        userId,
        categories
      });
    }

    const filter = { _id: logId };
    const update = {};
    const deleteQuery = {};
    if (upPhotos.length > 0) {
      update.$push = { photos: { $each: upPhotos } };
    }
    if (deletedImage.length > 0) {
      deleteQuery.$pullAll = { photos: deletedImage };
    }
    update.$set = {
      categories,
      date,
      weight,
      weightUnit,
      height,
      heightUnit,
      fat,
      note: sanitizedNote
    };

    const updatedLog = await Logs.findOneAndUpdate(filter, update, {
      new: true,
      upsert: false,
      timestamps: false
    });

    if (updatedLog) {
      const deleteLog = await Logs.findOneAndUpdate(filter, deleteQuery, {
        new: true,
        upsert: false,
        timestamps: false
      });

      if (deleteLog) {
        const authClient = await authorize();
        deletedImage.forEach(async (photo) => {
          await deleteFileFromDrive(photo, authClient)
        });

        resp.json({
          message: "Log updated successfully.",
          log: updatedLog,
          icon: "success"
        });
      } else {
        resp.json({
          message: "Error deleting photos from log.",
          icon: "error"
        });
      }
    } else {
      resp.json({
        message: "Log not found.",
        icon: "error"
      });
    }
  } catch (error) {
    console.error("Error while updating log:", error);
    resp.json({
      message: "Error while updating log.",
      error: error.message,
      icon: "error"
    });
  }
});

app.delete("/api/log", async (req, resp) => {
    let { logId } = req.body;
    try {
        if (logId) {
            const logFetched = await Logs.find({ _id: logId });
            const Delete = await Logs.deleteOne({
                _id: logId
            });
            if (Delete.deletedCount > 0) {
              const authClient = await authorize();
                logFetched[0].photos.forEach(async (photo) => {
                    await deleteFileFromDrive(photo, authClient)
                });
                resp.json({
                    message: "Log deleted successfully",
                    icon: "success"
                });
            } else {
                resp.json({
                    message: "Log not found"
                });
            }
        } else {
            resp.json({
                message: "No ID Selected"
            });
        }
    } catch (error) {
        console.error("Error occurred while deleting:", error);
        resp.json({
            message: "Error occurred while deleting: " + error
        });
    }
});

app.get("/api/logs", async (req, resp) => {
  let { userId, categories, start_date, end_date, isLatest } = req.query;

  const query = { userId };

  if (categories && (start_date || end_date)) {
    query.categories = { $in: JSON.parse(categories.replace(/'/g, '"')) };
    if (start_date != "null" || end_date != "null") {
      query.date = {};
      if (start_date && end_date) {
        end_date = end_date + 'T23:59:59Z';
        query.date.$gte = start_date;
        query.date.$lt = end_date;
      } else if (start_date) {
        query.date.$gte = start_date;
      } else if (end_date) {
        end_date = end_date + 'T23:59:59Z';
        query.date.$lt = end_date;
      }
    }
  } else if (categories) {
    query.categories = { $in: JSON.parse(categories.replace(/'/g, '"')) };
  } else if (start_date || end_date) {
    if (start_date != "null" || end_date != "null") {
      query.date = {};
      if (start_date && end_date) {
        end_date = end_date + 'T23:59:59Z';
        query.date.$gte = start_date;
        query.date.$lt = end_date;
      } else if (start_date) {
        query.date.$gte = start_date;
      } else if (end_date) {
        end_date = end_date + 'T23:59:59Z';
        query.date.$lt = end_date;
      }
    }
  }
try {
  let logs;
  if (isLatest === 'false') {
    logs = await Logs.find(query).sort({ date: 'asc' });
  } else {
    logs = await Logs.find(query).sort({ date: 'desc' });
  }
  
  resp.json({
    message: "Logs Fetched",
    icon: "success",
    logs: logs
  });
} catch (err) {
  console.error(err);
  resp.json({ error: err.message });
}
});

app.listen(PORT, () => {
    console.log("Server is running on port ",PORT);
});
