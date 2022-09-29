import AliyunSTS from '@alicloud/pop-core'

const stsClient = new AliyunSTS({
  accessKeyId: process.env.ZEITHROLD_ALIYUN_STS_ACCESSKEYID!,
  accessKeySecret: process.env.ZEITHROLD_ALIYUN_STS_ACCESSKEYSECRET!,
  endpoint: 'https://sts.cn-beijing.aliyuncs.com',
  apiVersion: '2015-04-01'
});

const STS_ROLE_ARN = 'acs:ram::1516286309654213:role/zsfiletransferrole'
const OSS_RESOURCE_ROOT = 'acs:oss:*:1516286309654213:zeithrold-file-transfer/'
type OSSAction = 'oss:GetObject' | 'oss:PutObject'

export interface StsRequestParam {
  RoleArn: string
  RoleSessionName: string
  DurationSeconds?: number
  Policy: {

    Version: "1",
    Statement: {
      Effect: 'Allow' | 'Deny'
      Action: OSSAction[]
      Resource: string[]
      Condition?: object
    }[]
  }
}

export interface StsRequestParamBuilt {
  RoleArn: string
  RoleSessionName: string
  DurationSeconds?: number
  Policy: string
}

export interface StsResponse {
  RequestId: string
  Credentials: {
    AccessKeyId: string
    AccessKeySecret: string
    Expiration: string
    SecurityToken: string
  }
  AssumedRoleUser: {
    Arn: string
    AssumedRoleId: string
  }
}

export function buildStsRequestParam({
  RoleArn,
  RoleSessionName,
  DurationSeconds,
  Policy
}: StsRequestParam) {
  const result: StsRequestParamBuilt = {
    RoleArn,
    RoleSessionName,
    DurationSeconds,
    Policy: JSON.stringify(Policy)
  }
  return result
}

export interface RequestForSTSTokenParams {
  filePath: string
  openid: string
  action: 'oss:PutObject' | 'oss:GetObject'
}

export async function requestForSTSToken({ filePath, action, openid }: RequestForSTSTokenParams) {
  const params = buildStsRequestParam({
    RoleArn: STS_ROLE_ARN,
    RoleSessionName: openid,
    Policy:
    {
      Version: "1",
      Statement: [{
        Effect: 'Allow',
        Action: [
          action
        ],
        Resource: [OSS_RESOURCE_ROOT + filePath]
      }],
    }
  })
  try {
    const result: StsResponse = await stsClient.request('AssumeRole', params, { method: 'POST' })
    return result
  } catch (e) {
    throw e
  }
}
