import fs from "fs";
const files = fs.readdirSync("./assets/pins").filter(f => f.endsWith(".svg"));
const lines = files.map(f => {
    const name = f.replace(".svg", "");
    return `export { default as ${name} } from "./${f}";`;
});
fs.writeFileSync("./assets/pins/index.ts", lines.join("\n"));
