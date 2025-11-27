import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './user.model'; // Import User model for association

// Interface for StlFile attributes
interface StlFileAttributes {
  id: string;
  name: string;
  description: string;
  s3Key: string; // The key of the object in the S3 bucket
  s3Url: string; // The full URL to the S3 object
  thumbnailS3Url?: string; // New field for thumbnail URL (optional)
  userId: string; // Foreign key for User
}

// Interface for StlFile creation attributes
type StlFileCreationAttributes = Optional<StlFileAttributes, 'id'>;

class StlFile extends Model<StlFileAttributes, StlFileCreationAttributes> implements StlFileAttributes {
  public id!: string;
  public name!: string;
  public description!: string;
  public s3Key!: string;
  public s3Url!: string;
  public thumbnailS3Url?: string; // New field
  public userId!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StlFile.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    s3Key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    s3Url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    thumbnailS3Url: { // New field definition
      type: DataTypes.STRING,
      allowNull: true, // Thumbnail is optional
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'stl_files',
  }
);

// Define the association
User.hasMany(StlFile, { foreignKey: 'userId', as: 'stlFiles' });
StlFile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default StlFile;
