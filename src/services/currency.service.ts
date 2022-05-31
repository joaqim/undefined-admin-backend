import Axios from "axios";
import { EOL } from "os";

class CurrencyService {
  public static async tryGetCurrencyRate(
    currency: string,
    dateFrom: string,
    dateTo: string
  ) {
    const url = `https://www.riksbank.se/sv/statistik/sok-rantor--valutakurser/?c=cAverage&f=Day&from=${dateFrom}&g130-SEK${currency}PMI=on&s=Dot&to=${dateTo}&export=csv`;

    const { data } = await Axios({
      method: "GET",
      url,
      headers: {
        "Content-Type": "*/*",
      },
    });

    let csvArray = data
      .replace(EOL, "")
      .split("\r")
      .map((value: string) => {
        if (value === "\n") return;
        return value.replace("\n", "");
      });
    let [, ...currencies] = csvArray;
    if (currencies.length < 2)
      throw new Error("Unexpected result from riksbank.se");
    let currencyRow = currencies[currencies.length - 2];
    let currencyRate = currencyRow.slice(
      currencyRow.lastIndexOf(`${currency};`) + 4
    );

    return currencyRate;
  }
}

export default CurrencyService;
