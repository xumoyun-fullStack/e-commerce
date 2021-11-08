const users = require("../models/UserModel")
const { generateHash, compareHash } = require("../modules/bcrypt");
const { v4 } = require("uuid");
const { generateJWTToken } = require("../modules/jwt");
const sendEmail = require("../modules/email");
const { PORT } = require("../../config");
const SignupValidation = require("../validations/SignupValidation");
const LoginValidation = require("../validations/LoginValidation");

module.exports = class UsersController{
    static async SignupController(req, res){
        try{
            const {full_name, email, username, password} = await SignupValidation(req.body);

            let user = await users.findOne({
                email,
                username,
            });

            if(user){
                throw new Error("User has already registered");
            }

            let pass = await generateHash(password);


            user = await users.create({
                user_id: v4(),
                full_name,
                username,
                email,
                password: pass,
            });

            let token = generateJWTToken({
                ...user._doc,
                password: undefined
            });
           

            let verificationEmail = await sendEmail(
                email,
                "Verification Link",
                null,
                `<p><a href="https://localhost:${PORT}/api/users/verify/${user._doc.user_id}">Click here</a> to activate your account</p>`
            )

            res.cookie("token", token).status(201).json({
                ok: true,
                message: "REGISTERED",
                user: user._doc,
                token,
            });




        }catch(e){
            console.log(e)
            res.status(400).json({
                ok: false,
                message: e + ""
            })
        }

    }

    static async VerifyEmailController(req, res){
        try{
            const { user_id } = req.params;

            let user = await users.findOneAndUpdate({user_id}, {is_verified: true})

            res.status(200).json({
                ok: true,
                verified: true,
                user,
            })
        }catch(e){
            console.log(e)
        }
    };

    static async LoginController(req, res){
        try{
          const {email, password} = await LoginValidation(req.body);
          
          let user = await users.findOne({email});

          if(!user){
              throw new Error("User is not registered");
          }

          let isPasswordTrue = await compareHash(user.password, password);


          if(!isPasswordTrue) throw new Error("Incorrect Password");

          let token = generateJWTToken({
              ...user._doc,
              password: undefined

          });

          res.cookie("token", token).status(200).json({
              ok: true,
              message: "Logged in",
              user,
              token
          })
        }catch(e){
            res.status(400).json({
                ok: false,
                message: e + ""
            })
        }
    }

    
}