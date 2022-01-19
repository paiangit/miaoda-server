// https://www.npmjs.com/package/bcryptjs
import * as bcrypt from 'bcryptjs';

// 生成salt（盐）
export function genSalt() {
  return bcrypt.genSaltSync(10);
}

export async function encrypt(data: string, salt = genSalt()) {
  const result = await bcrypt.hash(data, salt);
  console.log('加密完成');
  return result;
}
