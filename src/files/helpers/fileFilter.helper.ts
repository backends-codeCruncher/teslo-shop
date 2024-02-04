export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  const fileExtension = file.mimetype.split('/').at(1);
  const validImageExtensions = ['jpg', 'png', 'jpeg', 'gif'];

  if (validImageExtensions.includes(fileExtension)) return callback(null, true);

  callback(
    new Error(`
    File extension is not valid: ${fileExtension}.
    Valid extensions ${validImageExtensions}`),
    false,
  );
};
