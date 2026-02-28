import * as fs from "fs";
import * as path from "path";
import Mocha from "mocha";

const collectTests = (dir: string): string[] => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTests(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".test.js")) {
      files.push(fullPath);
    }
  }

  return files;
};

async function run(): Promise<void> {
  const mocha = new Mocha({ ui: "bdd", color: true });
  const testRoot = path.resolve(__dirname);

  const testFiles = collectTests(testRoot).sort();
  for (const file of testFiles) {
    mocha.addFile(file);
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
