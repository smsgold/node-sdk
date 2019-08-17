export class SmsgoldSdkError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SmsgoldSdkError';
    this.message = message;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error()).stack;
    }
  }
}

export class PropertyError extends SmsgoldSdkError {
  property: any;

  constructor(property) {
    super(`Invalid ${property}`);
    this.name = 'PropertyError';
    this.property = property;
  }
}
