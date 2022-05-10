import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';

export function initSentry() {
  Sentry.init({
    dsn: 'http://3db7aaa14aa241e9a57755fc95f31423@localhost:9000/3',
    tracesSampleRate: 1.0,
  });

  const transaction = Sentry.startTransaction({
    op: 'test',
    name: 'My first test transaction',
  });

  setTimeout(() => {
    try {
      // 制造一个错误
      // @ts-ignore
      foo();
    } catch (e) {
      Sentry.captureException(e);
    } finally {
      transaction.finish();
    }
  }, 99);
}
