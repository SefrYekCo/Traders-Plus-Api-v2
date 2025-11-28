
echo Running $(pwd)/$(basename "$0")
echo Parameters: $*
source /usr/local/Miniconda3/etc/profile.d/conda.sh
conda init powershell
conda activate

if [ $# -ne 1 ]; then
  echo "Missing parameter(s)"
  exit 1
fi

env=$1
prod='prod'

if [  $env == $prod ]; then
  cd /home/p188-traderplus-api-prod/current/p188-traderplus-api/report/
fi
pwd

python main.py  --env ${env}

conda deactivate