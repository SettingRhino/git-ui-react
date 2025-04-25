import axios, { AxiosResponse } from 'axios';
import { AxiosRequestConfig } from "axios";
import {gitContentBase64Decode } from "../index.ts"
import type {GiteaBranchCommits, GiteaTagResponse} from "../index.ts"

//
// const gitUrl =  import.meta.env.VITE_GITEA_URL;
// const gittoken =  import.meta.env.VITE_GITEA_TOKEN;

/**
 * Link 헤더 값을 파싱하여 rel 속성별 URL을 추출하는 헬퍼 함수입니다.
 * @param linkHeader Link 헤더 값 (undefined일 수 있음).
 * @returns 관계 타입(예: 'next', 'last')을 해당 URL에 매핑하는 객체.
 */
const parseLinkHeader = (linkHeader: string | undefined): { [key: string]: string } =>{
    if (!linkHeader) {
        return {};
    }

    const links: { [key: string]: string } = {};
    const parts = linkHeader.split(','); // 쉼표(,)를 기준으로 링크 분리

    parts.forEach((part: string) => {
        const section = part.split(';'); // URL 부분과 rel 속성 분리
        if (section.length < 2) {
            return; // 잘못된 형식의 부분은 건너뜀
        }

        // URL 추출 (< > 사이의 값)
        const urlMatch = section[0].trim().match(/<([^>]+)>/);
        // rel 속성값 추출 (rel= 다음 "" 사이의 값)
        const relMatch = section[1].trim().match(/rel="([^"]+)"/);

        if (urlMatch && relMatch) {
            links[relMatch[1]] = urlMatch[1]; // 관계 타입(key)에 URL(value) 저장
        }
    });

    return links;
}
/**
 * 특정 페이지의 데이터를 가져오고, 다음 페이지가 있으면 재귀적으로 호출하는 함수입니다.
 * @param url 데이터를 가져올 URL.
 * @param accumulatedDatas 이전 페이지들에서 누적된 데이터 배열.
 * @returns 모든 페이지의 데이터가 포함된 배열로 resolve되는 Promise.
 */
const fetchDatasRecursive = async (url: string, token: string, accumulatedDatas: any[] = []): Promise<any[]> => {
    console.log(`호출 중: ${url}`); // 디버깅을 위한 로그

    const config: AxiosRequestConfig = {
        method: 'get',
        url: url, // 제공된 URL 사용 (초기 URL 또는 다음 페이지 URL)
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            // GitLab이 다른 헤더를 요구할 경우 여기에 추가
        },
        // 다음 페이지 URL에는 이미 쿼리 파라미터가 포함되어 있으므로 여기서는 'params'를 설정하지 않음
    };

    try {
        const response: AxiosResponse<any[]> = await axios(config);

        // 현재 페이지의 데이터
        const currentPageDatas = response.data;
        // 누적된 데이터와 현재 페이지 데이터를 합침
        const allDatas = accumulatedDatas.concat(currentPageDatas);

        // 'link' 헤더 가져오기 (axios는 헤더 이름을 소문자로 변환함)
        const linkHeader = response.headers['link'];
        // Link 헤더를 파싱하여 URL 목록 얻기
        const links = parseLinkHeader(linkHeader);

        // 'next' 링크가 있는지 확인
        if (links.next) {
            // 'next' 링크가 있다면, 다음 페이지 URL과 합쳐진 데이터를 가지고 재귀 호출
            console.log(`다음 페이지 발견: ${links.next}`);
            return await fetchDatasRecursive(links.next, token,allDatas);
        } else {
            // 재귀 종료 조건: 'next' 링크가 없으면, 모든 누적된 데이터를 반환
            console.log('더 이상 페이지 없음. 가져오기 완료.');
            return allDatas;
        }
    } catch (error: any) {
        // Axios 에러 객체에서 상태 코드와 데이터에 접근 시도
        const status = error.response?.status;
        const data = error.response?.data;
        console.error(`'${url}'에서 데이터 가져오기 오류:`, `상태 ${status}`, data || error.message);
        // 오류 처리 전략: 오류를 던지거나, 부분적으로 수집된 데이터를 반환하는 등의 처리가 가능
        // throw new Error(`데이터 가져오기 실패: ${error.message}`);
        // 또는 수집된 부분 데이터 반환:
        console.warn('오류로 인해 부분적으로 가져온 데이터를 반환합니다.');
        return accumulatedDatas;
    }
}


const getBranchByGitea = async (url:string, token: string,repoName: string, branchName: string): Promise<any> => {
    const initialUrl = `${url}/api/v1/repos/${repoName}/branches/${branchName}`;

    const config: AxiosRequestConfig = {
        method: 'get',
        url: initialUrl, // 제공된 URL 사용 (초기 URL 또는 다음 페이지 URL)
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        // 다음 페이지 URL에는 이미 쿼리 파라미터가 포함되어 있으므로 여기서는 'params'를 설정하지 않음
    };
    return axios(config);
};

const getCommitsByGitea = async (url:string, token: string,repoName: string, branchName: string, perPage: number = 1): Promise<any[]> => {
    const initialUrl = `${url}/api/v1/repos/${repoName}/commits?sha=${branchName}&limit=${perPage}`;
    console.log('Commits 대한 재귀적 가져오기 시작...');
    // 초기 URL로 재귀 프로세스 시작
    return fetchDatasRecursive(initialUrl, token);
};


const getBranchCommitByGitea = async (url:string, token: string,repoName: string, branchName: string): Promise<any> => {
    try {
        const brancheRes = await getBranchByGitea(url, token,repoName, branchName);
        const branch = brancheRes.data;
        const commits = await getCommitsByGitea(url, token, repoName, branchName);
        return { branch, commits };
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const getBranchesCommitByGitea = async (url:string, token: string,repoName: string, branchNames: string[]): Promise<any> => {
    try {
        return await Promise.all(branchNames.map(branchName => getBranchCommitByGitea(url, token,repoName, branchName)));
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const getTagsByGitea = async (url:string, token: string,repoName: string, perPage: number = 100): Promise<any[]> => {
    try {
        const initialUrl = `${url}/api/v1/repos/${repoName}/tags?limits=${perPage}`;
        return fetchDatasRecursive(initialUrl,token);
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getBranchesCommitWithTagsByGitea = async (url:string, token: string, repoName: string, branchNames: string[]): Promise<{
    tags: GiteaTagResponse[];
    branchCommits: GiteaBranchCommits[];
}> => {
    try {
        const branchCommits = await getBranchesCommitByGitea(url, token,repoName, branchNames)
        const tags = await getTagsByGitea(url, token,repoName)
        return {
            branchCommits,
            tags,
        }
    }catch (error) {
        console.error(error);
        throw error;
    }
}

export const getCommitDiffByGitea = async (url:string, token: string, repoName: string, commitSha: string): Promise<any> => {
    try {
        const initialUrl = `${url}/api/v1/repos/${repoName}/git/commits/${commitSha}.patch`;

        const config: AxiosRequestConfig = {
            method: 'get',
            url: initialUrl, // 제공된 URL 사용 (초기 URL 또는 다음 페이지 URL)
            headers: {
                'Authorization': `Bearer ${token}`,
                // GitLab이 다른 헤더를 요구할 경우 여기에 추가
            },
            // 다음 페이지 URL에는 이미 쿼리 파라미터가 포함되어 있으므로 여기서는 'params'를 설정하지 않음
        };
        const diffString = await axios(config);

        return diffString.data || '';
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getCommitOriginFileByGitea = async (url:string, token: string,repoName: string | number, commitSha: string, path: string): Promise<any> => {
    const initialUrl = `${url}/api/v1/repos/${repoName}/contents/${encodeURIComponent(path)}?ref=${commitSha}`;
    const config: AxiosRequestConfig = {
        method: 'get',
        url: initialUrl, // 제공된 URL 사용 (초기 URL 또는 다음 페이지 URL)
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            // GitLab이 다른 헤더를 요구할 경우 여기에 추가
        },
        // 다음 페이지 URL에는 이미 쿼리 파라미터가 포함되어 있으므로 여기서는 'params'를 설정하지 않음
    };

    const response = await axios(config);
    return gitContentBase64Decode(response.data?.content || null)
};
