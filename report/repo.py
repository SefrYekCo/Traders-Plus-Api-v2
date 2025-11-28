import requests
import pandas as pd
import os
import datetime
from utils import transString

now = datetime.datetime.now()


class Repository:
    def __init__(self, env):
        if env == 'local':
            self.base_path = os.path.join('')
            self.banner_data_path = os.path.join(self.base_path, 'results')
        else:
            self.banner_data_path = os.path.abspath(f'/home/tradersPlusReports')

    def save_file(self, df: pd.DataFrame, file_path, dir_path):
        if not os.path.exists(dir_path):
            os.mkdir(dir_path)
        df.to_csv(file_path, index=False, encoding='utf-8-sig')

    def get_and_save_data(self, link, type):
        response = requests.get(link)

        data = pd.read_json(response.content)
        df = pd.DataFrame(data.response.reports)

        for index, row in df.iterrows():
            if type == "banner":
                fid = {'date': now, 'name': row["name"], "total": row["total"], "bannerId": row["bannerId"],
                       "type": "banner"}
            if type == "service":
                fid = {'date': now, 'name': row["name"], "total": row["total"], "serviceId": row["serviceId"],
                       type: "service"}
            dataframe = pd.DataFrame(fid, index=["date"])
            state, csv = self.check_and_read_banner_csv(row["name"], type)
            name = row["name"]
            if state == False:
                self.save_file(dataframe,
                               self.banner_data_path + os.path.sep + transString(type, str(name)) + ".csv",
                               './results')
            else:
                self.save_file((csv).append(dataframe),
                               self.banner_data_path + os.path.sep + transString(type, str(name)) + ".csv",
                               './results')

    def check_and_read_banner_csv(self, name, type):
        if self.is_data_file_exist(name, type):
            banner_path = f"{self.banner_data_path + os.path.sep + transString(type, str(name))}.csv"
            banner_csv = self.read_csv(banner_path)
            return True, banner_csv
        else:
            return False, None

    def is_data_file_exist(self, file, type):
        stock_path = f"{self.banner_data_path + os.path.sep + transString(type, str(file))}.csv"
        if not os.path.isfile(stock_path):
            return False
        else:
            return True

    @staticmethod
    def read_csv(path):
        return pd.read_csv(path)
