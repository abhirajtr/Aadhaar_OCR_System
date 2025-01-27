import Tesseract from "tesseract.js";

export const processOCR = async (imageBuffer) => {
    try {
        const { data } = await Tesseract.recognize(imageBuffer, "eng",
            // {
            //     logger: (info) => console.log(info),
            // }
        );
        return data.text;
    } catch (error) {
        throw new Error("Error during OCR processing: " + error.message);
    }
};