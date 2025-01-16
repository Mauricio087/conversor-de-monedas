const apiURL = "https://mindicador.cl/api";
const resultDiv = document.getElementById("result");
const errorDiv = document.getElementById("error");
const chartCanvas = document.getElementById("chart");
let chartInstance;

document.getElementById("convert").addEventListener("click", async () => {
  const amount = document.getElementById("amount").value;
  const currency = document.getElementById("currency").value;

  resultDiv.textContent = "";
  errorDiv.textContent = "";

  if (amount <= 0) {
    errorDiv.textContent = "Por favor, ingrese un monto válido.";
    return;
  }

  try {
    const response = await fetch(apiURL);

    if (!response.ok) {
      throw new Error("No se pudo obtener los datos de la API");
    }

    const data = await response.json();
    const conversionRate = data[currency].valor;
    const convertedValue = (amount / conversionRate).toFixed(2);

    resultDiv.textContent = `${amount} CLP son ${convertedValue} ${data[currency].nombre}`;

    renderChart(data[currency]);
  } catch (error) {
    errorDiv.textContent = `Error: ${error.message}`;
  }
});

async function renderChart(currencyData) {
  const historyEndpoint = `${apiURL}/${currencyData.codigo}`;

  try {
    const response = await fetch(historyEndpoint);

    if (!response.ok) {
      throw new Error(
        "No se pudo obtener los datos del historial de la moneda."
      );
    }

    const data = await response.json();
    const labels = data.serie
      .slice(0, 10)
      .map((entry) => entry.fecha.split("T")[0]);
    const values = data.serie.slice(0, 10).map((entry) => entry.valor);

    if (chartInstance) {
      chartInstance.destroy();
    }

    chartInstance = new Chart(chartCanvas, {
      type: "line",
      data: {
        labels: labels.reverse(),
        datasets: [
          {
            label: `Historial últimos 10 días (${currencyData.nombre})`,
            data: values.reverse(),
            borderColor: "#007BFF",
            borderWidth: 2,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
        },
      },
    });
  } catch (error) {
    errorDiv.textContent = `Error al cargar el gráfico: ${error.message}`;
  }
}