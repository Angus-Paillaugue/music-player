import { coverDir, incompleteDir } from "./songs";
import { mkdir } from "fs/promises";

export async function bootstrap() {
  await mkdir(incompleteDir, { recursive: true });
  await mkdir(coverDir, { recursive: true });
}
