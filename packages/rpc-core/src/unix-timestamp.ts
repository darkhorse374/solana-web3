export type UnixTimestamp = number & { readonly __brand: unique symbol };

export function isUnixTimestamp(putativeTimestamp: number): putativeTimestamp is UnixTimestamp {
    // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#the_epoch_timestamps_and_invalid_date
    if (putativeTimestamp > 8.64e15 || putativeTimestamp < -8.64e15) {
        return false;
    }
    return true;
}

export function assertIsUnixTimestamp(putativeTimestamp: number): asserts putativeTimestamp is UnixTimestamp {
    // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#the_epoch_timestamps_and_invalid_date
    try {
        if (putativeTimestamp > 8.64e15 || putativeTimestamp < -8.64e15) {
            throw new Error('Expected input number to be in the range [-8.64e15, 8.64e15]');
        }
    } catch (e) {
        throw new Error(`\`${putativeTimestamp}\` is not a timestamp`, {
            cause: e,
        });
    }
}

export function unixTimestamp(putativeTimestamp: number): UnixTimestamp {
    assertIsUnixTimestamp(putativeTimestamp);
    return putativeTimestamp;
}
