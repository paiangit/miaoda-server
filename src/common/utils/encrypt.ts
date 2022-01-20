// https://www.npmjs.com/package/bcryptjs
import * as bcrypt from 'bcryptjs';

// 生成salt（盐）
export function genSalt() {
  return bcrypt.genSaltSync(10);
}

export function encrypt(data: string, salt = genSalt()) {
  const result = bcrypt.hashSync(data, salt);
  console.log('加密完成');
  return result;
}

export function compare(plainData: string, encryptedData: string) {
  return bcrypt.compareSync(plainData, encryptedData);
}
