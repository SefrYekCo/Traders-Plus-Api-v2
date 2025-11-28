echo "This script is for running app"
echo "switches are --test --target  --port --users  --runs  --ramp-up --username  --password"

TEMP=`getopt -o a: --long test:,target:,port:,users:,runs:,ramp-up:,protocol:    -n 'example.bash' -- "$@"`

if [ $? != 0 ] ; then echo "Terminating..." >&2 ; exit 1 ; fi

# Note the quotes around `$TEMP': they are essential!
eval set -- "$TEMP"

while true ; do
    case "$1" in
        --test) TEST_NUMBER=$2 ; shift 2 ;;
        --target) TARGET_ADDRESS=$2 ; shift 2 ;;
        --port) PORT=$2 ; shift 2 ;;
        --users) NUMBER_OF_USERS=$2 ; shift 2 ;;
        --runs) RUN_COUNT=$2 ; shift 2 ;;
        --ramp-up) RAMP_UP=$2; shift 2 ;;
        --protocol) PROTOCOL=$2; shift 2;;

        --) shift ; break ;;
        *) ERROR_DESCRIPTION="internal Error!" ;exitWithError ; exit 1 ;;
    esac
done

exitWithError() {
        echo $ERROR_DESCRIPTION
        exit 1
}
echo Parameters:
echo TEST_NUMBER=$TEST_NUMBER  ,  TARGET_ADDRESS=$TARGET_ADDRESS , PORT=$PORT , NUMBER_OF_USERS=$NUMBER_OF_USERS , RUN_COUNT=$RUN_COUNT ,  RAMP_UP=$RAMP_UP ,   PROTOCOL=$PROTOCOL

if  [ -z "$TEST_NUMBER" ]; then
   ERROR_DESCRIPTION=" --test <test-number> is required"
   echo $ERROR_DESCRIPTION
   exit 1
fi

if [ -z "$NUMBER_OF_USERS" ]; then
    NUMBER_OF_USERS=100
fi

if [ -z "$RUN_COUNT" ]; then
    RUN_COUNT=10
fi

if [ -z "$RAMP_UP" ]; then
    RAMP_UP=1
fi

if [ -z "$PROTOCOL" ]; then
    PROTOCOL="http"
fi

DATE=`date +%Y-%m-%d--%H%M-%Z`


FILE_LIST=files.tmp
ls /home/p188-traderplus-api-qa/current/p188-traderplus-api/stress_test/ > $FILE_LIST

while read line
do
  file_name=$line

  #echo $file_name Started
  if [[ "$file_name" == "$TEST_NUMBER"*jmx ]] ;  then
    echo "Find test file" $file_name
    FILE_NAME_ORIG=$file_name
  fi
done < $FILE_LIST



FILE_NAME_RUN=888-${FILE_NAME_ORIG}-run.jmx
FILE_NAME_LOG=999-${FILE_NAME_ORIG}-run.jmx




echo Parameters after default setting:
echo TEST_NUMBER=$TEST_NUMBER  ,  TARGET_ADDRESS=$TARGET_ADDRESS , PORT=$PORT , NUMBER_OF_USERS=$NUMBER_OF_USERS , RUN_COUNT=$RUN_COUNT ,  RAMP_UP=$RAMP_UP ,PROTOCOL=$PROTOCOL

yes | cp -rf $FILE_NAME_ORIG jmx-archive/$FILE_NAME_RUN


echo "Replacing  token ..."
sed  -i -e "s|TOKEN_WILL_BE_REPLACED|$TOKEN|g" jmx-archive/$FILE_NAME_RUN

echo "Replacing NUMBER_OF_USERS with $NUMBER_OF_USERS"
sed  -i -e "s|NUMBER_OF_USERS|$NUMBER_OF_USERS|g" jmx-archive/$FILE_NAME_RUN

echo "Replacing RUN_COUNT with $RUN_COUNT"
sed  -i -e "s|RUN_COUNT|$RUN_COUNT|g" jmx-archive/$FILE_NAME_RUN

echo "Replacing RAMP_UP with $RAMP_UP"
sed  -i -e "s|RAMP_UP|$RAMP_UP|g" jmx-archive/$FILE_NAME_RUN

echo "Replacing TARGET_ADDRESS with $TARGET_ADDRESS"
sed  -i -e "s|TARGET_ADDRESS|$TARGET_ADDRESS|g" jmx-archive/$FILE_NAME_RUN

echo "Replacing PORT with $PORT"
sed  -i -e "s|PORT|$PORT|g" jmx-archive/$FILE_NAME_RUN

echo "Replacing PROTOCOL with $PROTOCOL"
sed  -i -e "s|PROTOCOL|$PROTOCOL|g" jmx-archive/$FILE_NAME_RUN

echo "Run jmeter ..."
echo logs are in logs/${FILE_NAME_LOG}-$DATE.log

/home/apache-jmeter-3.3/bin/jmeter.sh -n -t /home/p188-traderplus-api-qa/current/p188-traderplus-api/stress_test/jmx-archive/$FILE_NAME_RUN -l ${FILE_NAME_LOG}-$DATE.log

echo Moving log file to log folder
mv  ${FILE_NAME_LOG}-$DATE.log logs/
