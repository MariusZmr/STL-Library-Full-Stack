import { DataTypes, Model, Optional } from 'sequelize';
import bcrypt from 'bcrypt';
import sequelize from '../config/database';

// Interface for User attributes
interface UserAttributes {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
}

// Interface for User creation attributes (password is required)
interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {
    password?: string;
}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public password?: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Method to compare passwords
  public async comparePassword(password: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(password, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

export default User;
