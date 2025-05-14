import AsyncValidator, { Rules } from "async-validator";

const Schema = (<any>AsyncValidator).default;

async function validate(descriptor: Rules, data) {
  const validator = new Schema(descriptor);
  await validator.validate(data).catch((e) => {
    throw new Error(e.errors[0].message);
  });
}

export default { validate };
