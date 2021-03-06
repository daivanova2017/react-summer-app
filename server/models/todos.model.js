module.exports = (Sequelize, sequelize) => {
  const todos = sequelize.define("todos", {
    id: {
      type         : Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey   : true,
      allowNull    : false
    },
    title: {
      type     : Sequelize.TEXT,
      allowNull: false
    },
    content: {
      type     : Sequelize.TEXT,
      allowNull: true
    },
    deadline: {
      type     : Sequelize.TEXT,
      allowNull: false
    },
    status: {
      type     : Sequelize.BOOLEAN,
      allowNull: false
    }
  },{
    timestamps: false
  })

  return todos
}