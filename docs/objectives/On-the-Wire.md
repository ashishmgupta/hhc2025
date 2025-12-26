---
icon: material/text-box-outline
---

# On the Wire

![On the Wire](../img/objectives/On-the-wire/On-the-wire_0.png)

**Difficulty**: :fontawesome-solid-star::fontawesome-solid-star::fontawesome-solid-star::fontawesome-solid-star::fontawesome-regular-star:<br/>
**Direct link**: [On-the-wire](https://signals.holidayhackchallenge.com/?&challenge=termSignals)


## Hints
??? tip "Bits and Bytes"
    **Critical detail - Bit ordering varies by protocol:**

    **MSB-first (Most Significant Bit first):**<br/>

    SPI and I2C typically send the highest bit (bit 7) first<br/>
    When assembling bytes: ```byte = (byte << 1) | bit_value```<br/>
    Start with an empty byte, shift left, add the new bit<br/>

    **LSB-first (Least Significant Bit first):**<br/>
    1-Wire and UART send the lowest bit (bit 0) first<br/>
    When assembling bytes: ```byte |= bit_value << bit_position```<br/>
    Build the byte from bit 0 to bit 7<br/>
    
    **I2C specific considerations:**<br/>

    Every 9th bit is an ACK (acknowledgment) bit - ignore these when decoding data<br/>
    The first byte in each transaction is the device address (7 bits) plus a R/W bit<br/>
    You may need to filter for specific device addresses <br/>

    **Converting bytes to text:**
    ```
    String.fromCharCode(byte_value)  // Converts byte to ASCII character
    ```

??? tip "Garbage?"
    **If your decoded data looks like gibberish:**

    The data may be encrypted with XOR cipher<br/>
    XOR is a simple encryption: ```encrypted_byte XOR key_byte = plaintext_byte```<br/>
    The same operation both encrypts and decrypts: ```plaintext XOR key = encrypted, encrypted XOR key = plaintext```<br/>
    How XOR cipher works:
    ```
    function xorDecrypt(encrypted, key) {
    let result = "";
    for (let i = 0; i < encrypted.length; i++) {
        const encryptedChar = encrypted.charCodeAt(i);
        const keyChar = key.charCodeAt(i % key.length);  // Key repeats
        result += String.fromCharCode(encryptedChar ^ keyChar);
    }
    return result;
    }
    ```
    **Key characteristics:** <br/>
    - The key is typically short and repeats for the length of the message<br/>
    - You need the correct key to decrypt (look for keys in previous stage messages)<br/>
    - If you see readable words mixed with garbage, you might have the wrong key or bit order<br/>
    
    **Testing your decryption:** <br/>
    - Encrypted data will have random-looking byte values<br/>
    - Decrypted data should be readable ASCII text<br/>
    - Try different keys from messages you've already decoded<br/>

??? tip "On Rails"
    **Stage-by-stage approach** <br/>

    1. Connect to the captured wire files or endpoints for the relevant wires.
    1. Collect all frames for the transmission (buffer until inactivity or loop boundary).
    1. Identify protocol from wire names (e.g., dq → 1-Wire; mosi/sck → SPI; sda/scl → I²C).
    1. Decode the raw signal:
    1. Pulse-width protocols: locate falling→rising transitions and measure low-pulse width.
    1. Clocked protocols: detect clock edges and sample the data line at the specified sampling phase.
    1. Assemble bits into bytes taking the correct bit order (LSB vs MSB).
    1. Convert bytes to text (printable ASCII or hex as appropriate).
    1. Extract information from the decoded output — it contains the XOR key or other hints for the next stage.
    ---

    1. Repeat Stage 1 decoding to recover raw bytes (they will appear random).
    1. Apply XOR decryption using the key obtained from the previous stage.
    1. Inspect decrypted output for next-stage keys or target device information.

    ---

    * Multiple 7-bit device addresses share the same SDA/SCL lines.
    * START condition: SDA falls while SCL is high. STOP: SDA rises while SCL is high.
    * First byte of a transaction = (7-bit address << 1) | R/W. Extract address with address = first_byte >> 1.
    * Identify and decode every device’s transactions; decrypt only the target device’s payload.
    * Print bytes in hex and as ASCII (if printable) — hex patterns reveal structure.
    * Check printable ASCII range (0x20–0x7E) to spot valid text.
    * Verify endianness: swapping LSB/MSB will quickly break readable text.
    * For XOR keys, test short candidate keys and look for common English words.
    * If you connect mid-broadcast, wait for the next loop or detect a reset/loop marker before decoding.
    * Buffering heuristic: treat the stream complete after a short inactivity window (e.g., 500 ms) or after a full broadcast loop.
    * Sort frames by timestamp per wire and collapse consecutive identical levels before decoding to align with the physical waveform.


## Objective

!!! question "Request"
   Help Evan next to city hall hack this gnome and retrieve the temperature value reported by the I²C device at address 0x3C. <br/>
   The temperature data is XOR-encrypted, so you’ll need to work through each communication stage to uncover the necessary keys. <br/>
   Start with the unencrypted data being transmitted over the 1-wire protocol.

??? quote "Evan Booth"
    So here's the deal - there are some seriously bizarre signals floating around this area.<br/>
    Not your typical radio chatter or WiFi noise, but something... different.<br/>
    I've been trying to make sense of the patterns, but it's like trying to build a robot hand out of a coffee maker - you need the right approach.<br/>
    Think you can help me decode whatever weirdness is being transmitted out there?


## Solution
This challenge consists of 3 parts of decoding 3 communication protocols : 1-Wire, SPI and I2C with information in 1-wire and SPI to retrieve the temperature value reported by the I²C device at address 0x3C.
![On the Wire](../img/objectives/On-the-wire/On-the-wire_1.png)

### 1-Wire signal

#### Collecting the 1-wire signals
We see the messages over websockets <br/>

| Header                                                         | 
| ---------------------------------------------------------------|
| ![On the Wire](../img/objectives/On-the-wire/On-the-wire_2.png){ width="900" }| 
| Messages                                                       |
| ![On the Wire](../img/objectives/On-the-wire/On-the-wire_3.png){ width="900" }|

The data from the websocket is in JSON format.<br/>
We write a python script to collect the data from the websockets and convert to CSV.

```py linenums="1" title="collect-1-Wire-data.py"
    import asyncio
    import websockets
    import csv
    import json
    import signal
    import sys

    running = True

    def signal_handler(sig, frame):
        global running
        print("\n[!] Stopping...")
        running = False

    signal.signal(signal.SIGINT, signal_handler)

    async def collect_data():
        uri = "wss://signals.holidayhackchallenge.com/wire/dq"

        # Define all fieldnames, even optional ones
        fieldnames = ["line", "t", "v", "marker"]

        with open("1-wire.csv", mode="w", newline="") as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()

            try:
                async with websockets.connect(uri) as websocket:
                    print(f"[+] Connected to {uri}")
                    while running:
                        try:
                            message = await asyncio.wait_for(websocket.recv(), timeout=10)
                            data = json.loads(message)

                            # Ensure 'marker' key is present
                            if "marker" not in data:
                                data["marker"] = ""

                            # Write row with all expected fields
                            row = {key: data.get(key, "") for key in fieldnames}
                            writer.writerow(row)
                            csvfile.flush()
                            print(f"[>] Logged: {row}")
                        except asyncio.TimeoutError:
                            print("[!] Timeout waiting for data... still listening.")
            except Exception as e:
                print(f"[!] Error: {e}")

    if __name__ == "__main__":
        asyncio.run(collect_data())
```

**Top 20 rows in the output 1-Wire-data.csv** <br/>
![On the Wire](../img/objectives/On-the-wire/On-the-wire_4.png) <br/>

| Column/Field Name      | Description                                             |
| ---------------------- | ------------------------------------------------------- |
| line                   | the data line [dq]                                      |
| t                      | timestamp of the signal transmission (in microsecond)   |
| v                      | logical voltage level on the dq line at time t          |
| marker                 | Annotation                                              |


#### Decoding the 1-wire signal

!!! note "From the hint"

    Pulse-width protocols: locate falling→rising transitions and measure low-pulse width.

??? "Understanding the falling and rising transition"
    A falling edge is detected when the signal transitions from HIGH (v=1) to LOW (v=0), marking the start of a LOW pulse. <br/>
    A rising edge occurs when the signal transitions from LOW to HIGH (v=0 to v=1), marking the end of the LOW pulse.<br/>
    Following the pulse-width protocol hint, falling→rising transitions are located.

??? "Understanding low-pulse width"
    - A pulse is when a signal:
        * leaves its idle state,
        * stays in another state for some time,
        * and then returns.

    - In 1-Wire:
        * Idle state = HIGH
        * Active state = LOW

    So a pulse looks like: 
    ```HIGH → LOW → HIGH```
    That LOW section is the pulse.

    **Width** = In signal processing with is is how long something lasts in time. <br/>
    Therefore : <br/>
    low-pulse width = time spent in LOW state
    and 
    LOW-pulse width = t(rising edge) - t(falling edge)


Based on the above concepts and understanding, we can visualize the signal transmission like below : <br/>

![On the Wire](../img/objectives/On-the-wire/On-the-wire_5.png) <br/>

Based on the data collected in the CSV from the websockets endpoint, we apply a threshold of more than 6 microseconds to identify meaningful transitions. <br/> 
Any timing difference greater than 6 microseconds is considered a valid signal boundary, while differences of 6 microseconds or less are treated as noise and discarded. <br/>



!!! success "Answer"
   Bartholomew Quibblefrost


## Response
!!! quote "Josh Wright"
    Excellent work! You've demonstrated textbook penetration testing skills across every challenge - your discipline and methodology are impeccable!.<br/>
