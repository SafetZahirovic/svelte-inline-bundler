import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
export const _dirname = dirname(__filename);

export const START_OF_FUNCTION = "let component;\n";
export const END_OF_FUNCTION = "\nreturn component;";
