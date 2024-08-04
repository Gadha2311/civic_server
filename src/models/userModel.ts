import{model,Document,Schema}from"mongoose"

interface IUser extends Document{
    username: string;
    email: string;
    password: string;
    bio:string;
    profilePicture?: string;
    blocked?: boolean;
    following?:string [];
    followers?:string [];
    blockedUsers?: string[];
    isAdmin?: boolean;
    isVerified?: boolean;
    isPrivate?:boolean;
    verificationToken?: string;
    verificationTokenExpires?: Date;
    resetPasswordToken?:string,
    resetPasswordExpires?: Date
    blockedMe?:string[]

}

const userSchema=new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
      },
      email: {
        type: String,
        required: true,
        unique:true,
      },
      password: {
        type: String,
        required: true,
      },
      bio:{
        type:String,
        default:"Write something..!!"
      },
      profilePicture: {
        type: String,
        default:
          "https://www.kindpng.com/picc/m/780-7804962_cartoon-avatar-png-image-transparent-avatar-user-image.png",
      },
      blocked: {
        type: Boolean,
        default: false,
      },
      following:{
        type: [String],
        default:[]
      },
      followers:{
        type: [String],
        default:[]
      },
      blockedUsers: {
        type: [String],
        default: [], 
      },
      blockedMe:{
        type:[String],
        default:[],
      },
      isAdmin: {
        type: Boolean,
        default: false,
      },
      isPrivate:{
        type:Boolean,
        default:false
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
      verificationToken: String,
      verificationTokenExpires: Date,
      resetPasswordToken: String,
      resetPasswordExpires:Date
    },
    { timestamps: true }
)

const UserModel= model<IUser>("users",userSchema)
export {IUser,UserModel}