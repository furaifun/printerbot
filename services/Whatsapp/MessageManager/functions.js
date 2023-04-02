const { writeFile } = require("fs/promises");
const { MP } = require("../../Billing/MP");
const PDF = require("../../PDF");
const Printer = require("../../Printer");
const chatConfig = require("../../../config/chat");
const { getPath } = require("../../../config/files");

const mp = new MP();

mp.init();

const replaceVars = (text, vars) => {
    let replaced = text;
    const keys = Object.keys(vars);

    keys.forEach((key) => {
        replaced = replaced.replace(
            new RegExp("\\$\\{" + key + "\\}", "g"),
            vars[key]
        );
    });

    return replaced;
};

const convertToPDF = async (filename) => {
    const { exec } = require("child_process");
    const filePath = getPath(filename);
    const pdfFilePath = getPath(`${filename}.pdf`);
    return new Promise((resolve, reject) => {
        exec(`unoconv -f pdf ${filePath}`, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            writeFile(pdfFilePath, stdout, "base64")
                .then(() => resolve(pdfFilePath))
                .catch((err) => reject(err));
        });
    });
};

const sendConfirmation = async (chat, response) => {
    await chat.sendMessage(response.functionMessages.confirmation);
    const { confirm } = await chatConfig.prompt(chat);
    return confirm;
};

module.exports = {
    manageFile: async (client, message, chat, extra, response) => {
        const { messageDb } = extra;
        const { filename } = messageDb;
        const media = await message.downloadMedia();
        const allowedExtensions = [".pdf", ".doc", ".docx", ".jpeg", ".png", ".jpg"];
    
        const fileExtension = filename.substr(filename.lastIndexOf("."));
    
        if (!allowedExtensions.includes(fileExtension)) {
            await chat.sendMessage(response.functionMessages.invalidFile);
            await messageDb.update({ status: "finish" });
            return;
        }
    
        await writeFile(getPath(filename), media.data, "base64");
        await chat.sendMessage(response.functionMessages.received);
        
        if (fileExtension === ".doc" || fileExtension === ".docx") {
            const pdfFilePath = await convertToPDF(filename);
            await chat.sendMessage(response.functionMessages.convertedToPDF);
            await messageDb.update({ filePath: pdfFilePath });
        } else {
            await messageDb.update({ filePath: getPath(filename) });
        }
        
        let confirm = await sendConfirmation(chat, response);
        if (confirm) {
            return { next: "selectPrintOptions" };
        } else {
            await chat.sendMessage(response.functionMessages.abort);
            await messageDb.update({ status: "finish" });
            return;
        }
    },

    selectPrintOptions: async (client, message, chat, extra, response) => {
        const { messageDb } = extra;
        const { filePath } = messageDb;
        let pages = await PDF.countPages(filePath);
        await chat.sendMessage(response.functionMessages.selectOptions);
        const { sheets, doubleSided } = await chatConfig.prompt(chat);
        const printOptions = {
            sheets,
            doubleSided
        };
        const id = mp.getPreferenceId();
        const price = mp.getPreferencePrice();
        const url = mp.paymentUrl();

        await chat.sendMessage(response.functionMessages.printOptionsSelected);
        await chat.sendMessage(
            replaceVars(response.functionMessages.created, {
                url,
                price,
                pages,
            })
        );
        await messageDb.update({
            preference_id: id,
            status: response.next
        })
    }





