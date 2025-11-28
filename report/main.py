import repo
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--env', '--env', help="current Env (local | qa | prod)", default='local')

args = parser.parse_args()
env = args.env

MyRepo = repo.Repository(env)

MyRepo.get_and_save_data("http://tradersplus.sefryek.com:5000/api/v1/service/report", "service")
MyRepo.get_and_save_data("http://tradersplus.sefryek.com:5000/api/v1/banner/report", "banner")
