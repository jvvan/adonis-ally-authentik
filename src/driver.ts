import { ApiRequest, Oauth2Driver, RedirectRequest } from '@adonisjs/ally'
import type { HttpContext } from '@adonisjs/core/http'
import type { AllyDriverContract, AllyUserContract, ApiRequestContract } from '@adonisjs/ally/types'

export type AuthentikDriverAccessToken = {
  token: string
  refreshToken?: string
  type: 'Bearer'
  expiredIn: number
  expiresAt: Date
  id_token: string
}

export type AuthentikDriverScopes =
  | 'openid'
  | 'profile'
  | 'email'
  | 'offline_access'
  | (string & {})

export type AuthentikDriverConfig = {
  clientId: string
  clientSecret: string
  callbackUrl: string
  authorizeUrl?: string
  accessTokenUrl?: string
  userInfoUrl?: string
  scopes?: AuthentikDriverScopes[]
}

export class AuthentikDriver
  extends Oauth2Driver<AuthentikDriverAccessToken, AuthentikDriverScopes>
  implements AllyDriverContract<AuthentikDriverAccessToken, AuthentikDriverScopes>
{
  protected authorizeUrl = ''
  protected accessTokenUrl = ''
  protected userInfoUrl = ''
  protected codeParamName = 'code'
  protected errorParamName = 'error'
  protected stateCookieName = 'authentik_oauth_state'
  protected stateParamName = 'state'
  protected scopeParamName = 'scope'
  protected scopesSeparator = ' '

  constructor(
    ctx: HttpContext,
    public config: AuthentikDriverConfig
  ) {
    super(ctx, config)

    this.loadState()
  }

  protected configureRedirectRequest(request: RedirectRequest<AuthentikDriverScopes>) {
    request.scopes(this.config.scopes || ['openid', 'profile', 'email'])
    request.param('response_type', 'code')
    request.param('grant_type', 'authorization_code')
  }

  protected configureAccessTokenRequest(request: ApiRequest) {
    if (!this.isStateless) {
      request.field('state', this.stateCookieValue)
    }
  }

  accessDenied() {
    return this.getError() === 'access_denied'
  }

  protected getAuthenticatedRequest(url: string, token: string): ApiRequest {
    const request = this.httpClient(url)
    request.header('Authorization', `Bearer ${token}`)
    request.header('Accept', 'application/json')
    request.parseAs('json')
    return request
  }

  protected async getUserInfo(token: string, callback?: (request: ApiRequestContract) => void) {
    const request = this.getAuthenticatedRequest(this.config.userInfoUrl || this.userInfoUrl, token)
    if (typeof callback === 'function') {
      callback(request)
    }

    const body = await request.get()

    return {
      id: body.sub,
      nickName: body.nickname,
      name: body.name,
      email: body.email,
      emailVerificationState: body.email_verified,
      avatarUrl: body.avatar,
      original: body,
    }
  }

  async user(
    callback?: (request: ApiRequestContract) => void
  ): Promise<AllyUserContract<AuthentikDriverAccessToken>> {
    const token = await this.accessToken(callback)
    const user = await this.getUserInfo(token.token, callback)

    return {
      ...user,
      token,
    }
  }

  async userFromToken(
    token: string,
    callback?: (request: ApiRequestContract) => void
  ): Promise<AllyUserContract<{ token: string; type: 'bearer' }>> {
    const user = await this.getUserInfo(token, callback)

    return {
      ...user,
      token: { token, type: 'bearer' as const },
    }
  }
}

export function authentik(config: AuthentikDriverConfig): (ctx: HttpContext) => AuthentikDriver {
  return (ctx) => new AuthentikDriver(ctx, config)
}
