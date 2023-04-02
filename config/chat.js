const { pricePerPage } = require("./billing");

module.exports = {
    response: {
        initial: {
          message: "🤖*Bienvenid@!*👋 \n ```El precio por pagina es de $18```. \n  ❗ Para cuidar el papel y ahorrar, desactiva la hoja de control desde tu PC 👉 https://youtu.be/lNOV3o3TBEk \n 📤 *Por favor, enviame el archivo que deseas imprimir*",
          file: {
            function: "manageFile",
            functionMessages: {
              received: "✅Archivo recibido correctamente✅",
              invalidFile: "❌El archivo que enviaste no es válido. Por favor, asegúrate de enviar un archivo en formato PDF, Word o imagen y vuelve a intentarlo. Gracias.",
            },
          },
        },
        selectPrintType: {
          message: "¿Deseas imprimir el archivo completo o seleccionar algunas hojas?",
          options: [
            { value: "Archivo completo", next: "selectPaperType" },
            { value: "Seleccionar hojas", next: "enterPages" },
          ],
        },
        enterPages: {
          message: "Ingrese el número de página/s que desea imprimir (separadas por coma):",
          input: {
            function: "processPages",
            functionMessages: {
              invalidPages: "❌ Página/s inválida/s. Por favor, ingrese números separados por coma.",
            },
          },
          next: "selectPaperType",
        },
        selectPaperType: {
          message: "¿Deseas imprimir en Simple Faz o Doble Faz?",
          options: [
            { value: "Simple Faz", next: "createPayment" },
            { value: "Doble Faz", next: "createPayment" },
          ],
        },
        createPayment: {
          function: "createPayment",
          functionMessages: {
            creating: "💲Creando link de pago...",
            created:
              "${url}\n Son ${pages} paginas y el valor es de *${price} ARS*",
          },
          next: "questPayment",
        },
        questPayment: {
          buttons: {
            title: "Realizar pago",
            footer: "",
            content: [{ body: "Realizado" }],
            body: "Aprete el boton cuando haya realizado el pago 👇",
          },
          options: [{ value: "Realizado", next: "checkPayment" }],
        },
        checkPayment: {
          message: "Verificando pago...⏳",
          function: "checkPayment",
          functionMessages: {
            notPaid:
              "❌El pago no se ha realizado correctamente.\nSi ya realizo el pago, reintentelo mas tarde",
            paid: "🥳Pago Recibido. \n 🖨️*Enviando a imprimir*🖨️",
          },
        },
        finish: {
          message: "Finalizado, Gracias😃",
        },
      }
}
