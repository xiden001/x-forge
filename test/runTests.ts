import * as path from "path";
import Mocha from "mocha";

async function run(): Promise<void> {
  const mocha = new Mocha({ ui: "bdd", color: true });
  const testDir = path.resolve(__dirname, "context");
  mocha.addFile(path.join(testDir, "chunker.test.js"));
  mocha.addFile(path.join(testDir, "scorer.test.js"));

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
