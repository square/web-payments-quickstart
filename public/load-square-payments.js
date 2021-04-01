function loadSquarePayments(env, locationId) {
  // TODO: Make this function idempotent.

  // Checkpoint 1.1 -  loading the SDK.
  // Three ways to load it:
  //
  // 1. If your page is static and npm isn't part of your toolchain: <script type="text/javascript" src="https://sandbox.web.squarecdn.com/v0/square.js"></script>
  // 2. If you are already using NPM, or any framework: npm install @square/websdk, then: import { payments } from "@square/websdk"
  // 3. If you enjoy making youre life more difficult than it needs to be. Dynamically attach script tag as seen below. This is what the npm package does for you under the hood.
  //
  // How does each compare performacnce wise? Does it matter where we put the tag?
  const squareSrc = {
    sandbox: 'https://sandbox.web.squarecdn.com/v0/square.js',
    production: 'https://web.squarecdn.com/v0/square.js',
  };

  // Non-secret client credentials
  const credential = {
    sandbox: {
      appId: 'sandbox-sq0idb-lybe_WkfKNAbb3WklswmwA',
    },
    production: {
      // Add your production credentials here
    },
  };

  if (env === 'production') {
    console.error(
      'Production is not supported in this example, but feel free to clone and add your production credentials here'
    );
  }

  // Dynamically add the CDN script to the page.
  const script = document.createElement('script');
  script.src = squareSrc.sandbox;
  const squarePromise = new Promise((resolve, reject) => {
    script.onload = async () => {
      if (!window.Square) {
        const e = new Error(
          'Something went wrong loading the Square Payments SDK'
        );
        console.error(e);
        reject(e);
        return;
      }
      console.log('Loading the Square Payments SDK script complete');

      console.log('Initialize Square.payments()');
      const payments = await window.Square.payments(
        credential[env].appId,
        locationId
      );
      console.log('Initialize Square.payments() complete');

      resolve(payments);
    };
  });

  console.log('Loading the Square Payments SDK script');
  document.body.append(script);

  return squarePromise;
}

export { loadSquarePayments };
