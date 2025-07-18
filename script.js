

async function readSerialData() {
  try {
      // Request a port and open a connection
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });

      // Wait for the port to be readable
      const reader = port.readable.getReader();

      try {
          while (true) {
              const { value, done } = await reader.read();
              if (done) {
                  // Reader has been canceled.
                  break;
              }

              // Decode the incoming data
              const decoder = new TextDecoder();
              const data = decoder.decode(value);
              console.log("Received data:", data); // Debug log

              // Parse the data (assuming it is comma-separated: "sensorId,temperature,co2,humidity,light")
              const segment = data.trim().split("!");
              if (segment.length >= 5) {
                  const sensorId = segment[0];
                  const temperature = segment[1];
                  const co2 = segment[2];
                  const humidity = segment[3];
                  const light = segment[4];

                  console.log("Parsed data:", { sensorId, temperature, co2, humidity, light }); // Debug log

                  updateTable(sensorId, temperature, co2, humidity, light);
              }
          }
      } catch (error) {
          console.error("Error reading from serial port:", error);
      } finally {
          reader.releaseLock();
          await port.close();
      }
  } catch (error) {
      console.error("There was an error opening the serial port:", error);
  }
}

// Function to update the table with sensor data
function updateTable(sensorId, temp, co2, humi, light) {
  const tbody = document.querySelector('#sensorTable tbody');
  let row = document.getElementById(`row${sensorId}`);

  // Create a new row if it doesn't exist
  if (!row) {
      row = document.createElement('tr');
      row.id = `row${sensorId}`;
      row.innerHTML = `
          <td id="sens${sensorId}">${sensorId}</td>
          <td id="temp${sensorId}">NA</td>
          <td id="co${sensorId}">NA</td>
          <td id="humi${sensorId}">NA</td>
          <td id="light${sensorId}">NA</td>
      `;
      tbody.appendChild(row);
  }

  // Update the row with the new data
  document.getElementById(`sens${sensorId}`).innerText = sensorId;
  document.getElementById(`temp${sensorId}`).innerText = temp;
  document.getElementById(`co${sensorId}`).innerText = co2;
  document.getElementById(`humi${sensorId}`).innerText = humi;
  document.getElementById(`light${sensorId}`).innerText = light;
}

// Set an interval to run the readSerialData function every 4 seconds
setInterval(readSerialData, 4000);