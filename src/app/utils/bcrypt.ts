import bcrypt from 'bcryptjs';

const hash = async (data: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(data, salt);
};

const compare = async (data: string, encrypted: string): Promise<boolean> => {
    return bcrypt.compare(data, encrypted);
};

export const bcryptUtils = {
    hash,
    compare,
};
