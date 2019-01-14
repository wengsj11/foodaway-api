const express = require('express');
const app = express();
const bodyParser = require('body-Parser');
const assert = require('assert');
const session = require('express-session')
const Tools = require('./utils/toolUtils');

const cros = (req, res,next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type");
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Credentials","true");
  next();
}
//设置跨域请求
app.use(cros);
// 使用 session 中间件
app.use(session({
  secret : 'secret', // 对session id 相关的cookie 进行签名
  resave : true,
  saveUninitialized: true, // 是否保存未初始化的会话
  cookie: {
    path: '/', //将session挂载在‘/’路径，这样所有的路由都可以访问到session
    httpOnly: true,
    secure: false,
    maxAge : 1000 * 60, // 设置 session 的有效时间，单位毫秒
    expires: new Date(Date.now() + 1000 * 60),
  },
}));
//静态资源路径
app.use(express.static('public'))
//post参数解析
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json())

app.get("/",(req, res)=>{
	res.end("3000 port");
});
/**
 * 用户api
 * 测试账号：
 * fo_f2d0ce45
 * 1234567
 * 123
 */
app.post('/login/pwd', (req, res) => {
  const Users = require('./schemas/users');
  const account = req.body.account;
  const password = req.body.password;
  if (!account || !password) {
    res.json({status: 0, msg: "账号或密码不能为空!", data: {}})
    res.end();
    return;
  }
  Users.findOne().or([{phone:account},{username:account}]).exec((err, docs) => {
    assert.equal(err, null);
    console.log(docs);
    if (!docs) {
      res.json({status: 0, msg: "账号不存在!", data: {}})
    }
    if (docs.password === password) {
      console.log('登录成功')
      res.json({status: 1, msg: "登录成功", data: docs})
    } else {
      console.log('密码错误')
      res.json({status: 0, msg: "密码错误!", data: {}})
    }
    res.end();
  })

})
app.post('/login/code', (req, res) => {
  const Users = require('./schemas/users');
  const phone = req.body.phone;
  const code = req.body.code;
  const captcha = req.session.captcha;
  console.log(req.session);
  if (!captcha) {
    res.json({status: 0, msg: "请先获取短信验证码!", data: {}})
    return;
  }
  if (!phone || !code) {
    res.json({status: 0, msg: "手机号或验证码不能为空!", data: {}})
    return;
  }
  if ( !(/^[0-9]+$/.test(phone)) ) {
    res.json({status: 0, msg: "手机号格式错误!", data: {}})
    return;
  }
  Users.findOne({phone}).exec((err, docs) => {
    assert.equal(err, null);
    console.log(docs);
    if (!docs) {
      //自动注册
      Users.create({
        username: 'fo_' + Tools.guid(),
        phone,
        password:'',
      }, (err, docs) => {
        console.log('成功登录注册');
        assert.equal(null, err);
        console.log(docs);
        res.json({status: 1, msg: "成功登录注册!", data: docs})
        res.end();
      })
      return;
    }
    if (code === captcha) {
      console.log('登录成功')
      res.json({status: 1, msg: "登录成功", data: docs})
    } else {
      console.log('验证码错误')
      res.json({status: 0, msg: "验证码错误!", data: {}})
    }
    res.end();
  })
})
//发送验证码
app.get('/code', (req, res) => {
  const phone = req.query.phone;
  if (!phone) {
    res.json({status: 0, msg: "手机号不能为空!", data: {}})
    return;
  }
  //发送短信验证码
  // const captcha = Tools.generateCode(4);
  // const params = [captcha, '1']; //对应短信模板的{1},{2}=>验证码 和 短信的有效分钟
  // Tools.sendCaptcha([phone], params, (err, res, resData) => {
  //   if (err) {
  //     console.log("err: ", err);
  //   } else {
  //     console.log("request data: ", res.req);
  //     console.log("response data: ", resData);
  //     //将验证码存入session中
  //     req.session.captcha = captcha;
  //     res.json({status: 1, msg: 'send captcha success!', data: {}})
  //     res.end(');
  //   }
  // })
  var hour = 1000 * 60;
  // req.session.cookie.maxAge = hour;
  req.session.captcha = '1111';
  console.log(req.session);
  res.json({status: 1, msg: 'send captcha success!', data: {}})
  res.end();
})

/**
 * 种类api
 * 
 */
//获取一级种类
app.get('/categories', (req, res) => {
  const Categories = require('./schemas/categories');
  Categories.find({}).exec((err, docs) => {
    assert.equal(err, null);
    console.log(docs);
    res.json({status: 1, msg: "ok", data: docs})
    res.end();
  })
})
//根据cid获取二级种类
app.get('/categorySeconds', (req, res) => {
  const CategorySeconds = require('./schemas/categorySeconds');
  const mongoose = require('mongoose');
  const cid = req.body.cid;
  CategorySeconds
    .findByCid(cid,(err, docs) => {
      assert.equal(err, null);
      console.log(docs);
      res.json({status: 1, msg: "ok", data: docs})
      res.end();
    })
})
/**
 * 商家api
 * 
 */
//根据csid获取商家列表
app.get('/restaurants', (req, res) => {
  const Restaurants = require('./schemas/restaurants');
  const params = {page:1}; //默认不传page属性，返回前10条数据
  if (req.body.csid) {
    params.csid = req.body.csid;
  }
  if (req.body.page) {
    params.page = req.body.page;
  }
  Restaurants.findByPage(params,(err, docs) => {
      assert.equal(err, null);
      console.log(docs);
      res.json({status: 1, msg: "ok", data: docs})
    })
})
//根据商家id获取商家详情
app.get('/restaurants/:id', (req, res) => {
  const Restaurants = require('./schemas/restaurants');
  Restaurants.findById(req.params.id, (err, docs) => {
    assert.equal(err, null);
    console.log(docs);
    res.json({status: 1, msg: "ok", data: docs})
  })
})
app.get('/restaurants/add', (req, res) => {
  const Restaurants = require('./schemas/restaurants');
  Restaurants.create({
    name: "粥品香坊（回龙观）",
    score: 4.2, //评级星星数
    min_price: 20, //起送价
    delivery_fee: 4, //配送费
    delivery_time: 38, //配送时间
    monthly: 90, //月销售量
    bulletin: "粥品香坊其烹饪粥料的秘方源于中国千年古法，在融和现代制作工艺，由世界烹饪大师屈浩先生领衔研发。坚守纯天然、0添加的良心品质深得消费者青睐，发展至今成为粥类的引领品牌。是2008年奥运会和2013年园博会指定餐饮服务商。",
    avatar: 'http://static.galileo.xiaojukeji.com/static/tms/seller_avatar_256px.jpg', //图片路径
  }, (err, docs) => {
    assert.equal(null, err);
    // console.log(docs);
    res.end('添加商家')
  })
})
app.get('/foods', (req, res) => {
  const Foods = require('./schemas/foods');
  const rid = req.body.rid;
  Foods.findByRId(rid,(err, docs) => {
    assert.equal(null, err);
    console.log(docs);
    res.json({status: 1, msg: "ok", data: docs})
  })
})
app.get('/foods/:id', (req, res) => {
  const Foods = require('./schemas/foods');
  Foods.findById(req.params.id,(err, docs) => {
    assert.equal(null, err);
    console.log(docs);
    res.json({status: 1, msg: "ok", data: docs})
  })
})
app.get('/menus', (req, res) => {
  const Menus = require('./schemas/menus');
  Menus.find({}, (err, docs) => {
    assert.equal(null, err);
    console.log(docs);
    res.json({status: 1, msg: "ok", data: docs})
    res.end();
  })
 })
// app.get('/menus/add', (req, res) => {
//   const Menus = require('./schemas/menus');
//   const arr = require('./data/menus');
//   for (let i = 0; i < arr.length; i++) {
//     Menus.create(
//       arr[i]
//     ,((err, docs) => {
//       assert.equal(null, err);
//       // console.log(docs);
//       console.log('添加菜单'+i)
//     }))
//     res.end();
// }
// })
// app.get('/menus/addimg', (req, res) => {
//   const Menus = require('./schemas/menus');
//   const arr = require('./data/menusImg');
//   Menus.find({}, (err, docs) => {
//     for (let i = 0; i < docs.length; i++) {
//       Menus.find({ _id: docs[i]._id }).update(arr[i], (err, docs) => {
//             console.log('更新菜单'+i)
//       });
//     }
//       res.end();
//   });
// })

app.listen(3000, () => {
  console.log('server running at 3000');
})

