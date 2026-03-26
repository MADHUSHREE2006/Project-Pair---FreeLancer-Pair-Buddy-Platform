import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Avatar uploads
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'projectpair/avatars', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], transformation: [{ width: 400, height: 400, crop: 'fill' }] },
})

// Chat / general file uploads
const fileStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: 'projectpair/uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'zip'],
    resource_type: file.mimetype.startsWith('image') ? 'image' : 'raw',
  }),
})

const ALLOWED_MIMES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'application/zip',
])

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMES.has(file.mimetype)) cb(null, true)
  else cb(new Error(`File type not allowed: ${file.mimetype}`), false)
}

const fileSizeLimit = { fileSize: 10 * 1024 * 1024 } // 10MB

export const uploadAvatar = multer({ storage: avatarStorage, limits: fileSizeLimit, fileFilter }).single('avatar')
export const uploadFile = multer({ storage: fileStorage, limits: fileSizeLimit, fileFilter }).single('file')

const localDiskStorage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`),
})
export const uploadLocal = multer({ storage: localDiskStorage, limits: fileSizeLimit, fileFilter }).single('file')

export const isCloudinaryConfigured = () =>
  !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
