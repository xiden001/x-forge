import * as fs from "fs";
import * as path from "path";
import Mocha from "mocha";

async function run(): Promise<void> {
  const mocha = new Mocha({ ui: "bdd", color: true });
  const testDir = path.resolve(__dirname, "context");

  const testFiles = fs
    .readdirSync(testDir)
    .filter((file) => file.endsWith(".test.js"))
    .sort();

  for (const file of testFiles) {
    mocha.addFile(path.join(testDir, file));
  }

  await new Promise<void>((resolve, reject) => {
    mocha.run((failures) => {
      if (failures > 0) {
        reject(new Error(`${failures} tests failed`));
        return;
      }
      resolve();
    });
  });
}

void run();
