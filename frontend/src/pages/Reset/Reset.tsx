import Navbar from '../../components/Navbar/Navbar';
import './Reset.scss'
import { useParams, Navigate } from 'react-router-dom'
import { useUserStore } from '../../store'
import { useState } from 'react';
import Forget from '../../pages/Forget/Forget';

interface Profile {
  nickname: string | undefined;
  campus_id: number | undefined;
  qq_id: string | undefined;
  avatar: string | undefined;
  theme_id: number | undefined;
  background_url: string | undefined;
  banner_url: string | undefined;
}

const Reset = () => {
  // const currentUser = useUserStore((state) => state.currentUser);
  // const userTheme = useUserStore((state) => state.userTheme);
  const { currentUser, userTheme, changeProfile, changeTheme, changeBackground, changeBanner, changeAvatar } = useUserStore();
  const defaultProfile: Profile = {
    nickname: currentUser?.nickname || '',
    campus_id: currentUser?.campus_id || 1,
    qq_id: currentUser?.qq || '',
    avatar: userTheme.avatar,
    theme_id: userTheme.theme_id,
    background_url: userTheme.background_url,
    banner_url: userTheme.banner_url,
  }
  const [profile, setProfile] = useState<Profile|null>(defaultProfile);
  console.log(profile);

  const { type } = useParams();//nickname campus_id qq_id avatar theme_id background banner
  
  const handleChange = (key: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProfile: Profile = {
      ...defaultProfile,
      [key]: (key === 'campus_id' || key === 'theme_id') ? Number(e.target.value) : e.target.value
    };
    setProfile(newProfile);
  };

  const handleProfileSubmit = async() => {
    changeProfile(profile?.nickname || '', profile?.campus_id || 1, profile?.qq_id || '');
  };

  const handleBannerSubmit = () => {
    changeBanner(profile?.banner_url || '');
  }
  const handleBackgroundSubmit = () => {
    changeBackground(profile?.background_url || '');
  }
  const handleAvatarSubmit = () => {
    changeAvatar(profile?.avatar || '');
  }
  const handleThemeSubmit = () => {
    changeTheme(profile?.theme_id || 1);
  }

  switch (type) {
    case 'nickname':
      return <div className='reset-container'>
        <Navbar title='重置昵称' backActive={true} backPath='settings'/>
        <input className='reset-text' type='text' placeholder='请输入新的昵称' onChange={handleChange('nickname')} />
        <button className='text-submit' onClick={handleProfileSubmit}>保存</button>
      </div>
    case 'campus_id':
      return <div className='reset-container'>
        <Navbar title='重置默认校区' backActive={true} backPath='settings'/>
        <input className='reset-text' type='text' placeholder='请输入默认校区' onChange={handleChange('campus_id')} />
        <button className='text-submit' onClick={handleProfileSubmit}>保存</button>
      </div>
    case 'qq_id':
      return <div className='reset-container'>
        <Navbar title='重置绑定QQ' backActive={true} backPath='settings'/>
        <input className='reset-text' type='text' placeholder='请输入要绑定的QQ号' onChange={handleChange('qq_id')} />
        <button className='text-submit' onClick={handleProfileSubmit}>保存</button>
      </div>
    case 'avatar':
      return <div className='reset-container'>
        <Navbar title='重置头像' backActive={true} backPath='settings'/>
        <div style={{marginTop: '60px'}}>功能开发中...</div>
      </div>
    case 'theme_id':
      return <div className='reset-container'>
        <Navbar title='重置主题风格' backActive={true} backPath='settings'/>
        <div style={{marginTop: '60px'}}>功能开发中...</div>
      </div>
    case 'background':
      return <div className='reset-container'>
        <Navbar title='重置发布页背景' backActive={true} backPath='settings'/>
        <div style={{marginTop: '60px'}}>功能开发中...</div>
      </div>
    case 'banner':
      return <div className='reset-container'>
        <Navbar title='重置资料卡背景' backActive={true} backPath='settings'/>
        <div style={{marginTop: '60px'}}>功能开发中...</div>
      </div>
    case 'password':
      return <Forget />
    default:
      return <Navigate to='/user/settings' replace />
  }
}

export default Reset
