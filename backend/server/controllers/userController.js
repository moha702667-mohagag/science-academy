import User from "../models/User.js";


// ==========================================
// جلب بيانات المستخدم
// ==========================================

export const getProfile = async (req, res) => {

  try {

    const user = await User.findById(req.user.id).select(
      "fullName email phone parentPhone address grade role"
    );

    if (!user) {

      return res.status(404).json({
        success: false,
        message: "User not found"
      });

    }

    res.status(200).json({

      success: true,

      user

    });

  } catch (error) {

    console.log("GET PROFILE ERROR:", error);

    res.status(500).json({

      success: false,
      message: "Server Error"

    });

  }

};


// ==========================================
// تعديل بيانات المستخدم
// ==========================================

export const updateProfile = async (req, res) => {

  try {

    const userId = req.user.id;

    const {
      fullName,
      phone,
      parentPhone,
      address
    } = req.body;


    // ==============================
    // التحقق من البيانات
    // ==============================

    if (!fullName || !phone) {

      return res.status(400).json({

        success: false,

        message: "الاسم ورقم الطالب مطلوبان"

      });

    }


    // ==============================
    // تحديث البيانات
    // ==============================

    const user = await User.findByIdAndUpdate(

      userId,

      {
        fullName,
        phone,
        parentPhone,
        address
      },

      {
        new: true,
        runValidators: true
      }

    ).select(
      "fullName email phone parentPhone address grade role"
    );


    // ==============================
    // المستخدم غير موجود
    // ==============================

    if (!user) {

      return res.status(404).json({

        success: false,

        message: "User not found"

      });

    }


    // ==============================
    // Response
    // ==============================

    res.status(200).json({

      success: true,

      message: "تم تحديث البيانات بنجاح",

      user

    });


  } catch (error) {

    console.log("UPDATE PROFILE ERROR:", error);

    res.status(500).json({

      success: false,

      message: "Server Error"

    });

  }

};