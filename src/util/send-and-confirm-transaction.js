// @flow

import invariant from 'assert';

import {Connection} from '../connection';
import {Transaction} from '../transaction';
import {sleep} from './sleep';
import type {Account} from '../account';
import type {TransactionSignature} from '../transaction';
import {DEFAULT_TICKS_PER_SLOT, NUM_TICKS_PER_SECOND} from '../timing';

/**
 * Sign, send and confirm a transaction
 */
export async function sendAndConfirmTransaction(
  connection: Connection,
  transaction: Transaction,
  ...signers: Array<Account>
): Promise<TransactionSignature> {
  let sendRetries = 10;
  let signature;
  for (;;) {
    const start = Date.now();
    signature = await connection.sendTransaction(transaction, ...signers);

    // Wait up to a couple slots for a confirmation
    let status = 'SignatureNotFound';
    let statusRetries = 6;
    for (;;) {
      status = await connection.getSignatureStatus(signature);
      if (status) {
        break;
      }

      if (--statusRetries <= 0) {
        break;
      }
      // Sleep for approximately half a slot
      await sleep((500 * DEFAULT_TICKS_PER_SLOT) / NUM_TICKS_PER_SECOND);
    }

    if ('Ok' in status) {
      break;
    }
    if (--sendRetries <= 0) {
      const duration = (Date.now() - start) / 1000;
      throw new Error(
        `Transaction '${signature}' was not confirmed in ${duration.toFixed(
          2,
        )} seconds (${status})`,
      );
    }

    if ('Err' in status && !status.includes('AccountInUse')) {
      throw new Error(`Transaction ${signature} failed (${status})`);
    }

    // Retry in 0..100ms to try to avoid another AccountInUse collision
    await sleep(Math.random() * 100);
  }

  invariant(signature !== undefined);
  return signature;
}
