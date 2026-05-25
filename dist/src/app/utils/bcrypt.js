import bcrypt from 'bcryptjs';
const hash = async (data) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(data, salt);
};
const compare = async (data, encrypted) => {
    return bcrypt.compare(data, encrypted);
};
export const bcryptUtils = {
    hash,
    compare,
};
