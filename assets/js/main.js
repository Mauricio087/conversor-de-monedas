const inputMonto = document.getElementById('input-monto');
const selectMoneda = document.getElementById('select-moneda');
const btnConvertir = document.getElementById('btn-convertir');
const resultado = document.getElementById('resultado');
const canvasGrafico = document.getElementById('grafico-historial');

let tasasConversion = {};

let chartInstance;

const fetchApiData = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.json();
};

const main = async () => {
  try {
    const data = await fetchApiData('https://mindicador.cl/api');
    tasasConversion = {
      dolar: data.dolar.valor,
      euro: data.euro.valor
    };

    btnConvertir.addEventListener('click', async () => {
      const monto = inputMonto.value;
      const moneda = selectMoneda.value;

      if (isNaN(monto) || !moneda || monto <= 0) {
        resultado.innerHTML = 'Por favor, ingrese un monto válido y seleccione una moneda.';
        return;
      }

      const tasa = tasasConversion[moneda];

      if (!tasa) {
        resultado.innerHTML = 'No se pudo realizar la conversión. Verifique los datos ingresados.';
        return;
      }

      const montoConvertido = (monto / tasa).toFixed(2);
      resultado.innerHTML = `El monto convertido es ${montoConvertido} ${moneda.toUpperCase()}.`;

      const historialData = await fetchApiData(`https://mindicador.cl/api/${moneda}`);
      const valores = historialData.serie.slice(0, 10).map(item => item.valor);
      const fechas = historialData.serie.slice(0, 10).map(item => new Date(item.fecha).toLocaleDateString());

      if (chartInstance) {
        chartInstance.destroy();
      }

      chartInstance = new Chart(canvasGrafico, {
        type: 'line',
        data: {
          labels: fechas.reverse(),
          datasets: [{
            label: `Historial de ${moneda.toUpperCase()} (últimos 10 días)`,
            data: valores.reverse(),
            borderColor:'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            fill: false
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true
            }
          }
        }
      });
    });
  } catch (error) {
    console.error('Error general en la aplicación:', error);
    resultado.innerHTML = 'Error al inicializar la aplicación. Intente nuevamente más tarde.';
  }
};

main();
