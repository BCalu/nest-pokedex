import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "node:path";
import { MongooseModule } from "@nestjs/mongoose";
import { PokemonModule } from "./pokemon/pokemon.module";
import { SeedModule } from './seed/seed.module';
import { ConfigModule } from "@nestjs/config";
import { EnvConfiguration } from "./config/env.config";
import { JoiValidationSchema } from "./config/joi.validation";

@Module({
  imports: [

    ConfigModule.forRoot({
      load: [EnvConfiguration],
      validationSchema: JoiValidationSchema,
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "public")
    }),

    MongooseModule.forRoot(
      process.env.MONGODB,
      {
        dbName: 'pokemonsdb',
      }
    ),

    PokemonModule,

    SeedModule,
  ]
})

export class AppModule {}
