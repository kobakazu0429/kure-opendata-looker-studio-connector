import "./auth";
import { cc } from "./datastudioapp";
import { kureOpendataClientWithToken } from "./client";
import { deepKeys, getProperty } from "dot-prop";
import { flatten, keys } from "./object-flatten";

const ja2en = {
  フィリピン: "philippines",
  ベトナム: "vietnam",
  ブラジル: "brazil",
  中国: "china",
  "韓国・朝鮮": "korea",
  インドネシア: "indonesia",
  ペルー: "peru",
  米国: "us",
  その他: "others",
  男: "man",
  女: "women",
};

const en2ja = Object.fromEntries(
  Object.entries(ja2en).map(([ja, en]) => [en, ja])
);

const ECP_API_TOKEN = "ECP_API_TOKEN" as const;
// const ECP_API_PATH = "ECP_API_PATH" as const;
// const ECP_API_PARAMS = "ECP_API_PARAMS" as const;

type ConfigParams = Record<
  typeof ECP_API_TOKEN,
  // | typeof ECP_API_PATH | typeof ECP_API_PARAMS,
  string
>;

// https://developers.google.com/datastudio/connector/reference#isadminuser
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isAdminUser: IsAdminUser = () => {
  return !false;
};

// https://developers.google.com/datastudio/connector/reference#getconfig
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getConfig: GetConfig = ({
  configParams,
}: GetConfigRequest & { configParams?: { path: string } }) => {
  const config = cc.getConfig();

  const isFirstRequest = configParams === undefined;
  if (isFirstRequest) {
    config.setIsSteppedConfig(true);

    config
      .newTextInput()
      .setId(ECP_API_TOKEN)
      .setName("データプラットフォームくれ APIトークン");
  }

  const kureOpendataClient = kureOpendataClientWithToken("");
  // const paths = Object.values(kureOpendataClient).map((v) => v.$path());
  const paths = Object.keys(kureOpendataClient);
  const pathConfig = config
    .newSelectSingle()
    .setId("path")
    .setName("Path")
    .setIsDynamic(true);
  paths.forEach((path) => {
    pathConfig.addOption(
      config.newOptionBuilder().setLabel(path).setValue(path)
    );
  });

  if (!isFirstRequest) {
    // validate a valid value was selected for configParams.country
    if (configParams.path === undefined) {
      cc.newUserError().setText("You must choose a path.").throwException();
    }

    const queries = {
      foreign_population_2: {
        get: {
          query: {
            /** 取得開始年 */
            start_year: "number",
            /** 取得終了年 */
            end_year: "number | undefined",
          },
        },
      },
    };

    // @ts-expect-error
    Object.entries(queries[configParams.path].get.query).forEach(
      ([key, type]) => {
        config
          .newTextInput()
          .setId(key)
          .setName(key)
          .setHelpText(type as string);
      }
    );
  }

  // config.newTextInput().setId(ECP_API_PATH).setName("ECP_API_PATH");

  /**
   * when ECP_API_TOKEN=/foreign-population-2
   * expected:
   * start_year=2013
   * end_year=2014
   */
  // config.newTextArea().setId(ECP_API_PARAMS).setName("ECP_API_PARAMS");

  return config.build();
};

const getFields = (request: any): Fields => {
  console.log(JSON.stringify(request, null, 2));
  const fields = cc.getFields();
  const types = cc.FieldType;
  const aggregations = cc.AggregationType;

  const kureOpendataClient = kureOpendataClientWithToken(
    request.configParams!.ECP_API_TOKEN
  );

  const response = kureOpendataClient.foreign_population_2.get({
    query: {
      start_year: request.configParams.start_year,
      end_year: request.configParams.end_year,
    },
  });

  keys(response.body)
    .filter((key) => key !== "year")
    .forEach((key) => {
      const id = key
        .split(".")
        .map((k) => {
          // @ts-expect-error
          if (!ja2en[k]) return k;
          // @ts-expect-error
          return ja2en[k];
        })
        .join(".");
      fields
        .newMetric()
        // .setId(key)
        .setId(id)
        .setName(key)
        .setType(types.NUMBER)
        .setAggregation(aggregations.SUM);
    });

  // keys(response.body)
  //   .filter((key) => key !== "year")
  //   .forEach((key) => {
  //     // const value = getProperty(response.body[0], key);
  //     fields
  //       .newMetric()
  //       .setId(key)
  //       .setType(types.NUMBER)
  //       .setAggregation(aggregations.SUM);
  //     // switch (typeof value) {
  //     //   case "number":
  //     //     break;

  //     //   default:
  //     //     break;
  //     // }
  //   });

  fields.newDimension().setId("year").setName("year").setType(types.NUMBER);

  return fields;
};

// https://developers.google.com/datastudio/connector/reference#getschema
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getSchema = <T = DefaultConfigParams>(request: GetSchemaRequest<T>) => {
  const schema = getFields(request).build();
  console.log(JSON.stringify(schema, null, 2));
  return { schema };
};

// const getParams = (paramsText: string): Record<string, string> => {
//   return paramsText
//     .split("\n")
//     .map((param) => {
//       const [key, ...value] = param.split("=");
//       return [key, value.join("=")];
//     })
//     .reduce((params, [k, v]) => ({ ...params, [k]: v }), {});
// };

// https://developers.google.com/datastudio/connector/reference#getdata
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getData: GetData<ConfigParams> = (request) => {
  console.log(JSON.stringify(request));
  if (typeof request.configParams?.ECP_API_TOKEN !== "string") {
    cc.newUserError().setText(`${ECP_API_TOKEN} not set.`).throwException();
  }

  // if (typeof request.configParams?.ECP_API_PATH !== "string") {
  //   cc.newUserError().setText(`${ECP_API_PATH} not set.`).throwException();
  // }

  // if (typeof request.configParams?.ECP_API_PARAMS !== "string") {
  //   cc.newUserError().setText(`${ECP_API_PARAMS} not set.`).throwException();
  // }

  // const params = getParams(request.configParams!.ECP_API_PARAMS);

  const kureOpendataClient = kureOpendataClientWithToken(
    request.configParams!.ECP_API_TOKEN
  );

  // console.log(deepKeys(kureOpendataClient.foreign_population_2.get({"query":{"start_year":}})));

  const requestedFields = getFields(request).forIds(
    request.fields.map((field) => field.name)
  );

  const data = kureOpendataClient.foreign_population_2.get({
    query: {
      // @ts-expect-error
      start_year: request.configParams.start_year,
      // @ts-expect-error
      end_year: request.configParams.end_year,
    },
  });

  console.log(requestedFields.asArray().map((field) => field.getName()));

  const rows: GetDataRows = data.body.map((r) => ({
    values: requestedFields.asArray().map((field) => {
      const _prop = field.getId();
      if (!_prop) return "";
      const prop = _prop
        .split(".")
        .map((k) => {
          if (!en2ja[k]) return k;
          return en2ja[k];
        })
        .join(".");
      const value = getProperty(r, prop);
      return value as any;
    }),
  }));

  return {
    schema: requestedFields.build(),
    rows: rows,
  };
};
