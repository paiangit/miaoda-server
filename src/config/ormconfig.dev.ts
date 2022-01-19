export default {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'miaoda',
  logging: false,
  timezone: '+08:00', // 服务器上配置的时区
  // 设置为true将自动加载项目中每一个通过forFeature()注册了的实体，
  // 将它们自动添加到配置对象的entities数组中,
  // forFeature()就是在某个service中的imports里面引入的
  // 采用这种方式，就不用在这里配置entities选项了，更加自动化
  autoLoadEntities: true,
  // 警告！！！
  // 生产环境下面这个选项一定要设置成false，否则会很容易造成你的数据被覆盖或被清除的情况；
  // 测试环境建议不要用，因为很容易导致辛辛苦苦建立的测试数据丢失；
  // 功能：根据实体自动创建数据库表。
  synchronize: true,
  // retryAttempts: 10, // 重试连接数据库的次数（默认：10）
  // retryDelay: 3000, // 两次重试连接的间隔(ms)（默认：3000）
  // autoLoadEntities: false, // 如果为true, 将自动加载实体(默认：false)
  // keepConnectionAlive: false, // 如果为true，在应用程序关闭后连接不会关闭（默认：false)
};
