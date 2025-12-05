const mongoose = require("mongoose");
const User = require('./models/schemas/user');
const Plan = require('./models/schemas/plan');
const Transaction = require('./models/schemas/transaction');

const runner = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/tradersplus?readPreference=primary&ssl=false', {
            useCreateIndex: true,
            useFindAndModify: false,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            socketTimeoutMS: 30000
        });

        const users = await User.aggregate([{
            $lookup: {
                from: 'transactions',
                localField: '_id',
                foreignField: 'user',
                as: 'transactions'
            }
        }]).limit(10).skip(0);

        
        console.log(users);
        // const res_users = await Promise.all(users.map(async (user) => {
        //     const transactions = await Transaction.find({ user: user._id, status: true });
        //     const amount = transactions.reduce((pre, curr) => {
        //         pre += Number(curr.amount)
        //         return pre;
        //     }, 0)
        //     const { signal, pro, signal_count, pro_count } = user.plans.reduce((obj, curr) => {
        //         if (curr.planId == '60f6c5a838d99969436ab929') {
        //             obj.pro_count++;
        //             obj.pro.push(new persianDate((new Date(curr.expireDate)).getTime()).format());
        //         }
        //         if (curr.planId == '60f7ce17fd2b6733bdb52cf2') {
        //             obj.signal_count++;
        //             obj.signal.push(new persianDate((new Date(curr.expireDate)).getTime()).format());
        //         }
        //         return obj;
        //     }, { signal: [], pro: [], pro_count: 0, signal_count: 0 });
        //     return { 'شماره موبایل': user.mobileNumber, 'کل مبلغ خرید': amount, 'نام': user.name, 'نام خوانوادگی': user.family, 'تاریخ ثبت نام': new persianDate((new Date(user.createdAt)).getTime()).format(), 'تاریخ انقضا سیگنال های خریداری شده!': signal.join('-----'), 'تعداد اشتراک های خریداری شده': pro.join('-----'), 'تاریخ انقضا اشتراک های خریداری شده': pro_count, 'تعداد سیگنال های خریداری شده': signal_count }
        // }));
        // var jsonInput = JSON.stringify(res_users)

        // var workbook = aspose.cells.Workbook()
        // var worksheet = workbook.getWorksheets().get(0)
        // var layoutOptions = aspose.cells.JsonLayoutOptions()
        // layoutOptions.setArrayAsTable(true)
        // aspose.cells.JsonUtility.importData(jsonInput, worksheet.getCells(), 0, 0, layoutOptions)
        // workbook.save("output.xls", aspose.cells.SaveFormat.AUTO)
        console.log('Done.')
    } catch (err) {
        console.error('connect db: ' + err.message);
        process.exit(1);
    }
};

runner();