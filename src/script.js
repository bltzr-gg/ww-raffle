// Set the delay amount for asynchronous operations.
const delayAmount = 1500;

// Calculate the SHA-256 hash of a given string asynchronously.
async function hashString(string) {
  const msgBuffer = new TextEncoder().encode(string);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Calculate the minimum hash segment length to cover all tickets.
function calculateMinHashSegmentLength(totalTickets) {
  let n = 1; // Start with 1 character
  while (16 ** n < totalTickets) {
    n++;
  }
  return n;
}

// Parse player input in CSV format and return an array of wallet addresses.
function parsePlayerInput(input) {
  return input
    .split("\n")
    .map((line) =>
      line
        .trim()
        .split(",")
        .map((s) => s.trim())
    )
    .reduce((acc, [walletAddress, tickets]) => {
      for (let i = 0; i < parseInt(tickets, 10); i++) {
        acc.push(walletAddress);
      }
      return acc;
    }, []);
}

// Update the display element with the provided text and optional loading indicator.
function updateDisplay(id, text, showLoading = false) {
  const element = document.getElementById(id);
  const loadingElement = document.getElementById(
    "loading" + id.charAt(0).toUpperCase() + id.slice(1)
  );
  let displayText =
    text.length > 48
      ? text.substring(0, 24) + "..." + text.substring(text.length - 23)
      : text;
  element.textContent = displayText;
  loadingElement.style.display = showLoading ? "inline" : "none";
}

// Asynchronously wait for a specified delay time.
async function waitForDelay(delayTime) {
  return new Promise((resolve) => setTimeout(resolve, delayTime));
}

// Concatenate an array of player wallet addresses into a single string asynchronously.
async function concatenatePlayers(players) {
  console.log(players.join(""));
  return players.join("");
}

// Calculate the SHA-256 hash of a given string asynchronously.
async function calculateHash(concatenatedString) {
  return await hashString(concatenatedString);
}

// Get the last minimum viable characters of a hexadecimal hash.
function calculateHexSegment(hash, numChars) {
  return hash.slice(-numChars);
}

// Normalize a hexadecimal segment to a value between 0 and 1.
function normalizeValue(hexSegment, numChars) {
  return parseInt(hexSegment, 16) / (16 ** numChars - 1);
}

// Determine the index of the winner based on a normalized value.
function determineWinnerIndex(normalizedValue, playersLength) {
  return Math.round(normalizedValue * (playersLength - 1));
}

// Display player wallets in sequence with a specified delay.
async function displayWalletsInSequence(wallets, winner, totalDuration) {
  let currentWalletIndex = 0;
  let elapsedTime = 0;
  const totalWallets = wallets.length;
  const updateInterval = Math.max(100, totalDuration / totalWallets);

  while (elapsedTime < totalDuration) {
    updateDisplay("winner", wallets[currentWalletIndex], false);
    currentWalletIndex = (currentWalletIndex + 1) % totalWallets;

    const remainingTime = totalDuration - elapsedTime;
    const delayTime = Math.min(updateInterval, remainingTime);
    await waitForDelay(delayTime);

    elapsedTime += delayTime;
  }

  updateDisplay("winner", winner, false);
}

// Pick a winner from a list of players and update the display.
async function pickWinner(players) {
  const uniqueWallets = [...new Set(players)];

  // Step 1: Concatenate Players
  updateDisplay("concatString", "Concatenating String...", true);
  await waitForDelay(delayAmount);
  const concatenatedString = await concatenatePlayers(players);
  updateDisplay("concatString", concatenatedString);

  // Step 2: Calculate Hash
  updateDisplay("hashValue", "Generating Hash...", true);
  await waitForDelay(delayAmount * 2);
  const hash = await calculateHash(concatenatedString);
  updateDisplay("hashValue", hash);

  // Step 3: Calculate Hex Segment
  console.log(players.length);
  const numChars = calculateMinHashSegmentLength(players.length);
  updateDisplay("hexSegment", "Calculating Hex Segment...", true);
  await waitForDelay(delayAmount * 3);
  const hexSegment = calculateHexSegment(hash, numChars);
  updateDisplay("hexSegment", hexSegment);

  // Step 4: Normalize Value
  updateDisplay("normalizedValue", "Normalizing Value...", true);
  await waitForDelay(delayAmount * 4);
  const normalizedValue = normalizeValue(hexSegment, numChars);
  updateDisplay("normalizedValue", normalizedValue.toFixed(4));

  // Step 5: Determine Winner
  updateDisplay("winnerIndex", "Determining Index...", true);
  await waitForDelay(delayAmount * 5);
  const winnerIndex = determineWinnerIndex(normalizedValue, players.length);
  updateDisplay("winnerIndex", winnerIndex.toString());

  // Display Final Winner
  updateDisplay("winner", "Determining Winner...", true);
  await displayWalletsInSequence(
    uniqueWallets,
    players[winnerIndex],
    delayAmount * 6
  );
}

// Add an event listener to the "Pick Winner" button to trigger the picking process.
document
  .getElementById("pickWinnerBtn")
  .addEventListener("click", async function () {
    const input = document.getElementById("playerInput").value;
    const players = parsePlayerInput(input);

    if (players.length === 0) {
      alert("Please enter player data.");
      return;
    }

    await pickWinner(players);
  });
