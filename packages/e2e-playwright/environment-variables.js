import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve('../../', '.env') });

const protocol = process.env.IS_HTTPS === 'true' ? 'https' : 'http';

export { protocol };
