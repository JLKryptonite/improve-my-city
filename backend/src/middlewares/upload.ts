import multer from "multer";

const storage = multer.memoryStorage();
export const upload = multer({
        storage,
        limits: { fileSize: 5 * 1024 * 1024, files: 5 }, // 5 MB, up to 5 photos
        fileFilter: (_req, file, cb) => {
                if (!/image\/(jpeg|png)/.test(file.mimetype))
                        return cb(new Error("Only JPEG/PNG allowed"));
                cb(null, true);
        },
});
